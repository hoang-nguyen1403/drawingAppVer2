import os
from django.conf import settings
import cv2
import numpy as np
import math
import itertools

from .detectAreaFunction import detectArea


def detectPicture(file_name):
    def get_end_points(pnts, img):
        node_coords = []
        for p in pnts:
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
        return node_coords

    def flat_segment_line(segment_line):
        segment_line = [segment_line[0][0], segment_line[0]
                        [1], segment_line[1][0], segment_line[1][1]]
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
        segment_combinations = itertools.combinations(segment_dict, 2)
        for couple_segment in segment_combinations:
            segment1, segment2 = couple_segment
            try:
                if segment_dict[segment1]['line'][0] in segment_dict[segment2]['line'] or segment_dict[segment1]['line'][1] in segment_dict[segment2]['line']:
                    angle = get_angle(
                        segment_dict[segment1]['line'], segment_dict[segment2]['line'])
                    if angle < 10:
                        if segment_dict[segment1]['precision'] > segment_dict[segment2]['precision']:
                            del segment_dict[segment2]
                        else:
                            del segment_dict[segment1]
            except:
                pass
        return segment_dict

    def display_result(matrix, segment_dict):
        white_board = np.zeros_like(matrix)
        for segment in segment_dict:
            cv2.line(white_board, segment_dict[segment]['line'][0], segment_dict[segment]['line'][1], color=[
                     255, 255, 255], thickness=2)
        # write_path = os.path.join(settings.MEDIA_ROOT,'result.png')
        # cv2.imwrite(write_path,white_board)

    # ========================== READ IMAGE =====================================
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
    read_path = os.path.join(settings.MEDIA_ROOT, file_name)
    img = cv2.imread(read_path, cv2.IMREAD_GRAYSCALE)
    bin_inv = cv2.bitwise_not(img)  # flip image colors
    bin_inv = cv2.dilate(bin_inv, np.ones((5, 5)))

    # ========================== FIND END POINTS =====================================
    th, img = cv2.threshold(
        img, 127, 255, cv2.THRESH_OTSU + cv2.THRESH_BINARY_INV)
    img = cv2.ximgproc.thinning(img)
    points = cv2.findNonZero(img)
    points = np.squeeze(points)
    node_coords = get_end_points(points, img)
    data["node_coords"] = node_coords
    data["num_nodes"] = len(data["node_coords"])
    data["node_names"] = [None]*data["num_nodes"]

    # =========================== FIND SEGMENTS ========================================
    segment_dict = {}
    count = 0
    lines = itertools.combinations(node_coords, 2)  # create all possible lines
    line_img = np.ones_like(img)*255  # white image to draw line markings on
    for line in lines:  # loop through each line
        # create a matrix to draw the line in
        bin_line = np.zeros_like(bin_inv)
        start, end = line  # grab endpoints
        cv2.line(bin_line, start, end, color=255, thickness=5)  # draw line
        conj = (bin_inv/255 + bin_line/255)  # create agreement image
        conj_line = (np.zeros_like(bin_inv) + bin_line/255)
        n_agree = np.sum(conj == 2)
        n_line = np.sum(conj_line == 1)
        precision = n_agree/n_line
        if precision > .9:
            cv2.line(line_img, start, end, color=[0, 200, 0], thickness=2)
            segment_dict[count] = {
                "line": [list(start), list(end)], "precision": precision}
            count += 1

    segment_dict = filter_overlap(segment_dict)
    display_result(img, segment_dict)
    segments = []
    for segment in segment_dict:
        start_node = segment_dict[segment]["line"][0]
        end_node = segment_dict[segment]["line"][1]
        for node_index in range(0, len(data["node_coords"])):
            if start_node == data["node_coords"][node_index]:
                start_node_index = node_index
            if end_node == data["node_coords"][node_index]:
                end_node_index = node_index
        try:
            segments.append([start_node_index, end_node_index])
        except IndexError:
            print("IndexError")
    data["segments"] = segments
    data["num_segments"] = len(data["segments"])
    data["segment_names"] = [None]*data["num_segments"]
    # tim giao diem
    return data


def detectLine(line, intersections):
    intersections.sort()
    listLine = []
    listLine.append([line[0], intersections[0]])
    for i in range(0, len(intersections)-1):
        listLine.append(intersections[i], intersections[i]+1)
    listLine.append([line[1], intersections[len(intersections)-1]])

    return listLine
