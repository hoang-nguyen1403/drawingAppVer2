import cv2
import numpy as np
import math
from scipy.spatial import cKDTree
import itertools
import json
import sys
from pprint import pprint
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
        approx = cv2.approxPolyDP(contour, 0.01 * cv2.arcLength(contour, True), True)
        contour_list = approx.ravel() #convert array to list

        for i in range(0,len(contour_list)):
            if i % 2 == 0:
                x = contour_list[i]
                y = contour_list[i+1]
                distances, ids = kdtree.query([x, y])
                surface_nodes.append(ids)

        surface_nodes_copy = surface_nodes.copy()
        surface_nodes_copy.append(surface_nodes_copy[0])
        surface_segments = []
        for node_index in range(len(surface_nodes_copy)-1):
            surface_segments.append([surface_nodes_copy[node_index],surface_nodes_copy[node_index+1]])
        segment_status = True
        for segment in surface_segments:
            if segment not in segments:
                segment_status = False
                print(segment)
        if len(list(dict.fromkeys(surface_nodes))) >= 3 and len(list(dict.fromkeys(surface_nodes))) == len(surface_nodes) and segment_status:
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
        min_x, min_y = max(min_x - 3, 0), max(min_y - 3, 0)
        max_x, max_y = min(max_x + 3, width), min(max_y + 3, height)
        min_x, max_x = min(x, min_x), max(x+w, max_x)
        min_y, max_y = min(y, min_y), max(y+h, max_y)
    if max_x - min_x > 0 and max_y - min_y > 0:
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


def get_end_points(points, img):
    node_coords = []
    count = 0
    for p in points:
        try:
            x = p[0]
            y = p[1]
            n = 0
            n += img[y - 1, x]
            n += img[y - 1, x - 1]
            n += img[y - 1, x + 1]
            n += img[y, x - 1]
            n += img[y, x + 1]
            n += img[y + 1, x]
            n += img[y + 1, x - 1]
            n += img[y + 1, x + 1]
            n /= 255
            if n == 1:
                node_coords.append(p.tolist())
        except:
            count += 1
    print('miss', count,'points')
    return node_coords


def find_end_points(file_name):
    img = cv2.imread(file_name, cv2.IMREAD_GRAYSCALE)
    img = remove_shadows(img)
    th, img = cv2.threshold(img, 127, 255, cv2.THRESH_OTSU + cv2.THRESH_BINARY_INV)
    img = cv2.ximgproc.thinning(img)
    points = cv2.findNonZero(img)
    points = np.squeeze(points)
    node_coords = get_end_points(points, img)
    return node_coords


def get_precision(bin_inv, bin_line):
    conjs = (bin_inv + bin_line)
    n_agree = np.sum(conjs == 2)
    n_line = np.sum(bin_line == 1)
    precision = n_agree / n_line
    return precision


def flat_segment_line(segment_line):
    segment_line = [segment_line[0][0], segment_line[0][1], segment_line[1][0], segment_line[1][1]]
    return segment_line

def dot_product(v1, v2):
    return sum((a*b) for a, b in zip(v1, v2))

def get_length(v):
    return math.sqrt(dot_product(v, v))

def get_angle(segment1, segment2):
    v1 = flat_segment_line(segment1)
    v2 = flat_segment_line(segment2)
    return math.degrees(math.acos(dot_product(v1, v2) / (get_length(v1) * get_length(v2))))


def filter_overlap(segment_dict):
    segment_combinations = itertools.combinations(segment_dict,2)
    for couple_segment in segment_combinations:
        segment1, segment2 = couple_segment
        try:
            segment1_start_node, segment1_end_node = segment_dict[segment1]['line']
            if segment1_start_node in segment_dict[segment2]['line'] or segment1_end_node in segment_dict[segment2]['line']:
                    angle = get_angle(segment_dict[segment1]['line'], segment_dict[segment2]['line'])
                    if angle < 10:
                        if segment_dict[segment1]['precision'] > segment_dict[segment2]['precision']:
                            del segment_dict[segment2]
                        else:
                            del segment_dict[segment1]
        except:
            pass
    return segment_dict


def find_segments(node_coords,end_point_coords,file_name):
    img = cv2.imread(file_name, cv2.IMREAD_GRAYSCALE)
    img = remove_shadows(img)
    th, img = cv2.threshold(img, 127, 255, cv2.THRESH_OTSU + cv2.THRESH_BINARY_INV)
    bin_inv = cv2.dilate(img, np.ones((13, 13)))
    # bin_copy = bin_inv.copy()
    # cv2.imshow('bin_inv', bin_inv)
    segment_dict = {}
    count = 0
    lines = itertools.combinations(end_point_coords, 2)  # create all possible lines
    bin_inv = bin_inv / 255
    for line in lines:  # loop through each line
        bin_line = np.zeros_like(bin_inv) # create a matrix to draw the line in
        start, end = line  # grab endpoints
        cv2.line(bin_line, start, end, color=1, thickness=1)  # draw line
        # cv2.line(bin_copy, start, end, color=255, thickness=1)  # draw line
        precision = get_precision(bin_inv, bin_line)
        if precision > .7:
            segment_dict[count] = {"line": line, "precision": precision, "intersection":False}
            count += 1

    for node_coord in node_coords:
        for end_point_coord in end_point_coords:
            bin_line = np.zeros_like(bin_inv)
            cv2.line(bin_line, node_coord, end_point_coord, color=1, thickness=1)
            # cv2.line(bin_copy, node_coord, end_point_coord, color=125, thickness=1)  # draw line
            precision = get_precision(bin_inv, bin_line)
            if precision > .7:
                segment_dict[count] = {"line": [node_coord,end_point_coord], "precision": precision, "intersection":False}
                count += 1
    # segment_dict = filter_overlap(segment_dict)
    segments = []
    for segment in segment_dict:
        segments.append(segment_dict[segment]["line"])
    # height, width = img.shape
    # height, width = int(height/2), int(width/2)
    # bin_copy = cv2.resize(bin_copy,(width,height), interpolation=cv2.INTER_AREA)
    # cv2.imshow('bin_copy', bin_copy)
    return segments

def detectPictureV3(file_name):
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
    # ===================== IMAGE PREPROCESSING  ===========================
    img = cv2.imread(file_name)
    img_copy = img.copy()
    # img = region_of_interest(img)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = remove_shadows(gray)
    ret , img_th = cv2.threshold(gray, 220,255,cv2.THRESH_BINARY)
    img_th = cv2.dilate(img_th, np.ones((1,1)))
    h, w = img_th.shape[:2]
    mask = np.zeros((h+2, w+2), np.uint8)
    cv2.floodFill(img_th, mask, (0,0), 0) # floodfill from point (0, 0)
    
    # ======================= FIND NODES ==============================
    contours, _ = cv2.findContours(img_th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    node_coords = []
    segment_coords = []
    for contour in contours:
        count = len(node_coords)
        approx = cv2.approxPolyDP(contour, 0.01 * cv2.arcLength(contour, True), True)
        contour_list = approx.ravel()
        
        for i in range(0,len(contour_list)):
            if i % 2 == 0:
                x = int(contour_list[i]) # numpy.intc doesn't work with json.dump()
                y = int(contour_list[i+1])
                node_coords.append([x,y])
        
        for i in range(count,len(node_coords)-1):
            segment_coords.append([node_coords[i], node_coords[i+1]])
        segment_coords.append([node_coords[-1], node_coords[count]])
    
    kdtree = cKDTree(node_coords)
    lines = itertools.combinations(node_coords,2)
    for line in lines:
        point1, point2 = line
        distance = math.dist(point1,point2)
        if distance < 15:
            try:
                node_coords.remove(point2)
            except ValueError:
                pass
    
    segments = []
    kdtree = cKDTree(node_coords)
    for segment in segment_coords:
        start_node, end_node = segment
        distances, ids = kdtree.query([start_node, end_node])
        segments.append(ids.tolist())

    clear_segments = []
    for segment in segments:
        segment.sort()
        if segment not in clear_segments and segment[0] != segment[1]:
            clear_segments.append(segment)
    segments = clear_segments

    for point in node_coords:
        cv2.circle(img, point, 7, (0,0,255), -1)

    # node_coords_copy = node_coords.copy()
    # flat_segment_list = [item for sublist in segments for item in sublist]
    # for i in range(len(node_coords)):
    #     if i not in flat_segment_list:
    #         node_coords_copy.remove(node_coords_copy[i])
    #         for segment_index in range(len(segments)):
    #             for coord_index in range(len(segments[segment_index])):
    #                 if segments[segment_index][coord_index] > i:
    #                     segments[segment_index][coord_index] -= 1
    # node_coords = node_coords_copy

    data["node_coords"] = node_coords
    data["num_nodes"] = len(data["node_coords"])
    data["node_names"] = [None]*data["num_nodes"]

    data["segments"] = segments
    data["num_segments"] = len(data["segments"])
    data["segment_names"] = [None]*data["num_segments"]
    data = detectArea(data)
    # =============== find all segments which don't make area =================

    # =============== FIND ALL POINTS ON LARGEST CONTOURS =============================
    # img_th = cv2.dilate(img_th, np.ones((13,13), np.uint8))
    # contours, _ = cv2.findContours(img_th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    # approx = cv2.approxPolyDP(contours[0], 0.001* cv2.arcLength(contours[0], True), True)
    # approx_list = approx.ravel()
    # cover_node_coords = []
    # for i in range(0,len(approx_list)):
    #     if i % 2 == 0:
    #         x = approx_list[i]
    #         y = approx_list[i+1]
    #         distances, ids = kdtree.query([x, y])
    #         cover_node_coords.append(node_coords[ids])
    # bin_cover_node_coords = []
    # for node in cover_node_coords:
    #     if node not in bin_cover_node_coords:
    #         bin_cover_node_coords.append(node)
    # cover_node_coords = bin_cover_node_coords
    end_point_coords = find_end_points(file_name)
    lines = find_segments(node_coords,end_point_coords, file_name)

    node_coords = node_coords + end_point_coords
    segment_list = []
    kdtree = cKDTree(node_coords)
    for segment in lines:
        start_node, end_node = segment
        distances, ids = kdtree.query([start_node, end_node])
        if distances[0] < 1e-5 and distances[1] < 1e-5 and ids[0] != ids[1]:
            segment_list.append(ids.tolist())
    
    segments = segments + segment_list

    node_coords_copy = node_coords.copy()
    flat_segment_list = [item for sublist in segments for item in sublist]
    for i in range(len(node_coords)):
        if i not in flat_segment_list:
            node_coords_copy.remove(node_coords_copy[i])
            print(i)
    node_coords = node_coords_copy
    
    for node_index in range(len(node_coords)):
        node = node_coords[node_index]
        node_coords[node_index] = [int(node[0]/2), int(node[1]/2)]
    
    data["node_coords"] = node_coords
    data["num_nodes"] = len(data["node_coords"])
    data["node_names"] = [None]*data["num_nodes"]

    data["segments"] = segments
    data["num_segments"] = len(data["segments"])
    data["segment_names"] = [None]*data["num_segments"]
    for point in data["node_coords"]:
        cv2.circle(img, point, 7, (0,255,0), -1)
        cv2.circle(img_copy, point, 7, (0,255,0), -1)
    for segment in data["segments"]:
        start_node = data["node_coords"][segment[0]]
        end_node = data["node_coords"][segment[1]]
        cv2.line(img_copy, start_node, end_node,(255,0,0),2)
    for surface in data["surfaces"]:
        surface_node_coords = [data["node_coords"][surface_node] for surface_node in surface]
        img = cv2.polylines(img,[np.array(surface_node_coords, np.int32)], isClosed= True, color = (0,0,255), thickness= 1)
    height, width, channels = img.shape
    height, width = int(height/2), int(width/2)
    img = cv2.resize(img,(width,height), interpolation=cv2.INTER_AREA)
    cv2.imshow('img', img)
    img_copy = cv2.resize(img_copy,(width,height), interpolation=cv2.INTER_AREA)
    cv2.imshow('copy',img_copy)
    return data

data = detectPictureV3('image1.jpg')
pprint(data)
with open('result.json', 'w') as outfile:
    json.dump(data, outfile)
cv2.waitKey(0)
cv2.destroyAllWindows()