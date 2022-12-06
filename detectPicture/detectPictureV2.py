import cv2
import numpy as np
import math
from scipy.spatial import cKDTree
import itertools
import json
import sys
# np.set_printoptions(threshold=sys.maxsize)


def detectArea(data):
    # =============== GET NODE COORDINATES AND SEGMENTS ============================
    raw_node_coords = data['node_coords']
    segments = data['segments']
    # =============== SCALE AND ROUND NODE COORDINATES =========================
    scale = 4
    scale_node_coords = [[round(x*scale),round(y*scale)] for [x,y] in raw_node_coords]
    kdtree = cKDTree(scale_node_coords)
    # =============== CREATE MATRIX =============================
    matrix = np.zeros((6000, 6000), 'uint8')
    # =============== DRAW SEGMENTS ============================
    for segment in segments:
        start_node = scale_node_coords[segment[0]]
        end_node = scale_node_coords[segment[1]]
        cv2.line(matrix, start_node, end_node,(255,0,0),2)
    # =============== MATRIX PREPROCESSING ==============================
    th, im_th = cv2.threshold(matrix, 127, 255, cv2.THRESH_BINARY_INV)
    h, w = im_th.shape[:2] # mask used to flood filling
    mask = np.zeros((h+2, w+2), np.uint8) # notice the size needs to be 2 pixels than the image.
    cv2.floodFill(matrix, mask, (0,0), 255) # floodfill from point (0, 0)
    matrix = cv2.bitwise_not(matrix) # invert foolfilled image
    # =============== FIND CONTOURS =============================
    contours, _ = cv2.findContours(matrix, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    # =============== FIND WHICH NODES THAT MAKE A SURFACE =============================
    surface_nodes = [] # list of nodes that make a surface
    surfaces = [] # list of many surfaces
    for contour in contours:
        approx = cv2.approxPolyDP(contour, 0.009 * cv2.arcLength(contour, True), True)
        contour_list = approx.ravel() #convert array to list

        for i in range(0,len(contour_list)):
            if i % 2 == 0:
                x = contour_list[i]
                y = contour_list[i+1]
                distances, ids = kdtree.query([x, y])
                surface_nodes.append(ids)

        if len(surface_nodes) >= 3:
            surfaces.append(surface_nodes)
        surface_nodes = []
    
    data['surfaces'] = surfaces
    data['surface_names'] = [None]*len(surfaces)
    return data


def region_of_interest(img):
    canny_img = cv2.Canny(img, 127, 255)
    contours, hierarchy = cv2.findContours(canny_img,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    height, width = canny_img.shape
    min_x, min_y = width, height
    max_x = max_y = 0
    for contour in contours:
        (x,y,w,h) = cv2.boundingRect(contour)
        min_x, max_x = min(x, min_x), max(x+w, max_x)
        min_y, max_y = min(y, min_y), max(y+h, max_y)
    if max_x - min_x > 0 and max_y - min_y > 0:
        # min_x, min_y = min_x - 3, min_y - 3
        # max_x, max_y = max_x + 3, max_y + 3
        img = img[min_y:max_y, min_x:max_x]
    return img


def remove_shadows(img):
    rgb_planes = cv2.split(img)
    result_planes = []
    for plane in rgb_planes:
        dilated_img = cv2.dilate(plane, np.ones((7,7), np.uint8))
        bg_img = cv2.medianBlur(dilated_img, 21)
        diff_img = 255 - cv2.absdiff(plane, bg_img)
        result_planes.append(diff_img)
        result = cv2.merge(result_planes)
        return result


def get_precision(bin_inv, bin_line):
    conjs = (bin_inv + bin_line)
    n_agree = np.sum(conjs == 2)
    n_line = np.sum(bin_line == 1)
    precision = n_agree / n_line
    return precision


def detectPictureV2(file_name):
    data = {
        "num_nodes": 0,
        "num_segments": 0,
        "node_coords": [],
        "node_names": [],
        "segments": [],
        "segment_names": [],
        "surfaces": [],
        "surface_names": [],
        "nodal_loads": [],
        "segment_loads": []
    }
    img = cv2.imread(file_name)
    img = region_of_interest(img)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = remove_shadows(gray)
    ret , threshed = cv2.threshold(gray,220,255,cv2.THRESH_BINARY)
    threshed = cv2.bitwise_not(threshed)
    threshed = cv2.ximgproc.thinning(threshed)
    cv2.imshow('bitwise',threshed)
    contours, hierarchy = cv2.findContours(threshed, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)
    canvas = img.copy()
    bin_inv = cv2.dilate(threshed, np.ones((7, 7)))/255
    node_coords = []
    old_point = None
    for contour in contours:
        epsilon = 0.001*cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour,epsilon, True)
        for point_array in approx:
            point = point_array[0].tolist()
            node_coords.append(point)
            # cv2.circle(canvas, point, 7, (0,255,0), -1)
            # if old_point is not None:
            #     bin_line = np.zeros_like(threshed)
            #     cv2.line(bin_line, point, old_point, color=1, thickness=1)
            #     precision = get_precision(bin_inv, bin_line)
            #     if precision > .6:
            #         cv2.line(canvas, point, old_point, (0,0,255),1,cv2.LINE_AA)
            # old_point = point
        # cv2.drawContours(canvas, [approx], -1, (0,0,255), 2, cv2.LINE_AA)
    print(node_coords)
    kdtree = cKDTree(node_coords)
    lines = itertools.combinations(node_coords,2)
    for line in lines:
        point1, point2 = line
        if math.dist(point1,point2) < 20:
            # point = [round((point1[0]+point2[0])/2),round((point1[1]+point2[1])/2)]
            # distances, ids = kdtree.query(point1)
            # node_coords[ids] = point1
            # print('point1', ids, point1)
            distances, ids = kdtree.query(point2)
            node_coords[ids] = point1

    print(node_coords)
    final_node_coords = []
    for node in node_coords:
        if node not in final_node_coords:
            final_node_coords.append(node)
    print('final_node_coords', final_node_coords)
    final_node_kdtree = cKDTree(final_node_coords)

    segments = []
    for point in node_coords:
        cv2.circle(canvas, point, 7, (0,255,0), -1)
        if old_point is not None:
            bin_line = np.zeros_like(threshed)
            cv2.line(bin_line, point, old_point, color=1, thickness=1)
            precision = get_precision(bin_inv, bin_line)
            if precision > .6:
                start_node, end_node = point, old_point
                cv2.line(canvas, start_node, end_node, (0,0,255),1,cv2.LINE_AA)
                distances, ids = final_node_kdtree.query([start_node, end_node])
                if distances[0] < 1e-5 and distances[1] < 1e-5:
                    segments.append(ids.tolist())
        old_point = point
    
    data["node_coords"] = final_node_coords
    data["num_nodes"] = len(data["node_coords"])
    data["node_names"] = [None]*data["num_nodes"]
    data["segments"] = segments
    data["num_segments"] = len(data["segments"])
    data["segment_names"] = [None]*data["num_segments"]
    cv2.imshow('canvas',canvas)

    # roi = np.zeros_like(img)
    # # ======================== FINE THE GRADIENT AT EVERY POINT ==============================
    # dx = cv2.Sobel(img, cv2.CV_32F, 1, 0, 7)
    # dy = cv2.Sobel(img, cv2.CV_32F, 0, 1, 7)
    # cv2.imshow('dx',dx)
    # cv2.imshow('dy',dy)
    # # ======================== TAKE THE DISTANCE TRANSFORM =============================
    # dist = cv2.distanceTransform(img, cv2.DIST_L2, 5)
    # cv2.imshow('dist',dist)
    # # ======================== MAT STROKE RADIUS ==============================
    # th = cv2.minMaxLoc(dist, None)
    # print('th')
    # print(th)
    # # ======================== FOR DISPLAY/DEBUG PURPOSES ==============================
    # rgb = np.zeros_like(img)
    # rgb2 = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    # rgb3 = np.zeros_like(img)
    # tmp = img.copy()
    # contours, hierarchy = cv2.findContours(tmp, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    # cv2.drawContours(rgb, contours, -1, (0, 255, 255), 1, 8)
    # cv2.drawContours(rgb2, contours, -1, (0, 255, 255), 1, 8)
    # cv2.drawContours(rgb3, contours, -1, (0, 255, 255), 1, 8)
    # cv2.imshow('rgb',rgb)
    # cv2.imshow('rgb2',rgb2)
    # cv2.imshow('rgb3',rgb3)
    # approx = cv2.approxPolyDP( contours[0], 0.9, True)
    # cv2.drawContours(rgb, approx, -1, (0, 255, 255), 1, 8)

    return data

# skeletonize the shape to get a single-pixel-wide path

data = detectPictureV2('image.png')
# data = detectArea(data)
print(data)
with open('result.json', 'w') as outfile:
    json.dump(data, outfile)
cv2.waitKey(0)
cv2.destroyAllWindows()

# draw contours: CollectPolyEdges and FillEdgeCollection
