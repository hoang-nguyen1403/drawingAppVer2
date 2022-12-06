import json
import cv2
import numpy as np
import sys
import math
import itertools
from scipy.spatial import cKDTree
np.set_printoptions(threshold=sys.maxsize)


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
        min_x, min_y = min_x - 3, min_y - 3
        max_x, max_y = max_x + 3, max_y + 3
        img = img[min_y:max_y, min_x:max_x]
    return img


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


def get_precision(bin_inv, bin_line):
    conjs = (bin_inv + bin_line)
    n_agree = np.sum(conjs == 2)
    n_line = np.sum(bin_line == 1)
    precision = n_agree / n_line
    return precision


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


def get_distance(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

def det(a, b):
    return a[0] * b[1] - a[1] * b[0]

def find_intersection(line1, line2):
    xdiff = (line1[0][0] - line1[1][0], line2[0][0] - line2[1][0])
    ydiff = (line1[0][1] - line1[1][1], line2[0][1] - line2[1][1])
    div = det(xdiff, ydiff)
    if div != 0:
        d = (det(*line1), det(*line2))
        x = det(d, xdiff) / div
        y = det(d, ydiff) / div
        length1 = get_distance(line1[0], line1[1])
        length2 = get_distance(line2[0], line2[1])
        if get_distance([x,y],line1[0]) < length1 and get_distance([x,y],line1[1]) < length1 and get_distance([x,y],line2[0]) < length2 and get_distance([x,y],line2[1]) < length2:
            return [round(x), round(y)]


def detectLine(line, intersections):
    all_points = list(line) + intersections
    all_points.sort()
    listLine = []
    for i in range(0,len(all_points)-1):
        listLine.append([all_points[i], all_points[i+1]])
    return listLine

def detectArea(data):
    # =============== GET NODE COORDINATES AND SEGMENTS ============================
    raw_node_coords = data['node_coords']
    segments = data['segments']

    # =============== SCALE AND ROUND NODE COORDINATES =========================
    scale = 4
    node_coords = [[round(x*scale),round(y*scale)] for [x,y] in raw_node_coords]

    # =============== CREATE MATRIX =============================
    matrix = np.zeros((6000, 6000), 'uint8')

    # =============== DRAW SEGMENTS ============================
    for segment in segments:
        start_node = node_coords[segment[0]]
        end_node = node_coords[segment[1]]
        cv2.line(matrix, start_node, end_node,(255,0,0),2)

    # =============== MATRIX PREPROCESSING ==============================
    th, im_th = cv2.threshold(matrix, 127, 255, cv2.THRESH_BINARY_INV)
    # mask used to flood filling
    h, w = im_th.shape[:2] # notice the size needs to be 2 pixels than the image.
    mask = np.zeros((h+2, w+2), np.uint8)
    cv2.floodFill(matrix, mask, (0,0), 255) # floodfill from point (0, 0)
    matrix = cv2.bitwise_not(matrix) # invert foolfilled image

    # =============== FIND CONTOURS =============================
    contours, _ = cv2.findContours(matrix, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    surface_nodes = [] # list of nodes that make a surface
    surface_segments = [] # list of segments that make a surface
    surfaces = [] # list of many surfaces
    surface_names = [] # list of surface names

    # =============== FIND WHICH NODES THAT MAKE A SURFACE =============================
    for contour in contours:
        approx = cv2.approxPolyDP(contour, 0.009 * cv2.arcLength(contour, True), True)

        #convert array to list
        contour_list = approx.ravel()

        for i in range(0,len(contour_list)):
            if i % 2 == 0:
                x = contour_list[i]
                y = contour_list[i+1]
                min_var = 9999
                for num_node in range(0,len(node_coords)):
                    delta =  abs(x-node_coords[num_node][0]) + abs(y-node_coords[num_node][1])
                    if delta < min_var:
                        min_var = delta
                        true_node = num_node #node which have the smallest delta is the most correct point
                surface_nodes.append(true_node)

    # =============== FIND WHICH SEGMENTS THAT MAKE A SURFACE FROM THOSE NODES =============================
        surface_nodes_copy = surface_nodes.copy()
        surface_nodes_copy.append(surface_nodes[0])
        
        for i in range(0, len(surface_nodes)):
            segment1 = [surface_nodes_copy[i], surface_nodes_copy[i+1]]
            segment2 = [surface_nodes_copy[i+1], surface_nodes_copy[i]]
            for j in range(0, len(segments)):
                if segment1 == segments[j] or segment2 == segments[j]:
                    surface_segments.append(j)
                    break
    
        # if surface_segment != []:
        if len(surface_segments) >= 3:
            surfaces.append(surface_nodes)
            surface_names.append(None)
        surface_nodes = []
        surface_segments = []
        surface_nodes_copy = []
    
    data['surfaces'] = surfaces
    data['surface_names'] = surface_names
    return data

def detectPicture(file_name):
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
    img = cv2.imread(file_name, cv2.IMREAD_GRAYSCALE)
    img = remove_shadows(img)
    cv2.imshow('remove shadow', img)
    img = region_of_interest(img)
    cv2.imshow('ROI',img)
    bin_inv = cv2.bitwise_not(img)  # flip image colors
    bin_inv = cv2.dilate(bin_inv, np.ones((1, 1)))


    # ========================== FIND END POINTS =====================================
    th, img = cv2.threshold(img, 127, 255, cv2.THRESH_OTSU + cv2.THRESH_BINARY_INV)
    img = cv2.ximgproc.thinning(img)
    points = cv2.findNonZero(img)
    print('non zero',points)
    points = np.squeeze(points)
    print('squeeze',points)
    cv2.imshow('find points', img)
    node_coords = get_end_points(points, img)

    # =========================== FIND SEGMENTS ========================================
    segment_dict = {}
    count = 0
    lines = itertools.combinations(node_coords, 2)  # create all possible lines
    bin_inv = bin_inv / 255
    for line in lines:  # loop through each line
        # create a matrix to draw the line in
        bin_line = np.zeros_like(bin_inv)
        start, end = line  # grab endpoints
        cv2.line(bin_line, start, end, color=1, thickness=1)  # draw line
        precision = get_precision(bin_inv, bin_line)
        if precision > .9:
            segment_dict[count] = {"line": line, "precision": precision, "intersection":False}
            count += 1
    segment_dict = filter_overlap(segment_dict)

    # =========================== FIND INTERSECTIONS =================================
    intersections = []
    bin_intersections = []
    segments = []

    for i in range(0, len(segment_dict)):
        inters_one_line = []
        segment1 = segment_dict[i]['line']
        for ii in range(0, len(segment_dict)):
            segment2 = segment_dict[ii]['line']
            intersection = find_intersection(segment1, segment2)
            if(intersection!= None):
                inters_one_line.append(intersection)
                segment_dict[i]['intersection'] = True
                segment_dict[ii]['intersection'] = True
                bin_intersections.append(intersection) 
            subline = detectLine(segment_dict[i]['line'], inters_one_line)
        segments += subline

    for i in range(0, len(segment_dict)):
        if(segment_dict[i]['intersection'] == False):
            segments.append(segment_dict[i]['line'])
    for intersection in bin_intersections:
        if intersection not in intersections:
            intersections.append(intersection)

    node_coords = node_coords + intersections
    data["node_coords"] = node_coords
    data["num_nodes"] = len(data["node_coords"])
    data["node_names"] = [None]*data["num_nodes"]

    segment_list = []
    kdtree = cKDTree(data["node_coords"])
    for segment in segments:
        start_node, end_node = segment
        distances, ids = kdtree.query([start_node, end_node])
        if distances[0] < 1e-5 and distances[1] < 1e-5:
            segment_list.append(ids.tolist())

    data["segments"] = segment_list
    data["num_segments"] = len(data["segments"])
    data["segment_names"] = [None]*data["num_segments"]
    return data

data = detectPicture('image.png')
data = detectArea(data)
print(data)
with open('result.json', 'w') as outfile:
    json.dump(data, outfile)
cv2.waitKey(0)
cv2.destroyAllWindows()
