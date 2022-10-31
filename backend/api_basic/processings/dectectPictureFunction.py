import cv2
import numpy as np
import math
import itertools

def detectPicture(file_name):
    def get_end_pnts(pnts, img):
        extremes = []    
        for p in pnts:
            x = p[0]
            y = p[1]
            n = 0        
            n += img[y - 1,x]
            n += img[y - 1,x - 1]
            n += img[y - 1,x + 1]
            n += img[y,x - 1]    
            n += img[y,x + 1]    
            n += img[y + 1,x]    
            n += img[y + 1,x - 1]
            n += img[y + 1,x + 1]
            n /= 255        
            if n == 1:
                extremes.append(p)
        return extremes

    def flat_segment_line(segment_line):
        segment_line = [segment_line[0][0],segment_line[0][1], segment_line[1][0], segment_line[1][1]]
        return segment_line

    def dot_product(v1, v2):
        return sum((a*b) for a, b in zip(v1, v2))

    def get_length(v):
        return math.sqrt(dot_product(v, v))

    def get_angle(segment1, segment2):
        v1 = flat_segment_line(segment1)
        v2 = flat_segment_line(segment2)
        return math.degrees(math.acos(dot_product(v1, v2) / (get_length(v1) * get_length(v2))))

    def filter_overlap(segments_list):
        segment_combinations = itertools.combinations(segments_list,2)
        for couple_segment in segment_combinations:
            segment1, segment2 = couple_segment
            try:
                if segments_list[segment1]['line'][0] in segments_list[segment2]['line'] or segments_list[segment1]['line'][1] in segments_list[segment2]['line']:
                        angle = get_angle(segments_list[segment1]['line'], segments_list[segment2]['line'])
                        if angle < 20:
                            if segments_list[segment1]['precision'] > segments_list[segment2]['precision']:
                                del segments_list[segment2]
                            else:
                                del segments_list[segment1]
            except:
                pass
        return segments_list

    def display_result(matrix,segments_list):
        white_board = np.zeros_like(matrix)
        for segment in segments_list:
            cv2.line(white_board, segments_list[segment]['line'][0], segments_list[segment]['line'][1], color=[255,255,255], thickness=2)
        cv2.imwrite('result.png',white_board)

    img = cv2.imread(file_name, cv2.IMREAD_GRAYSCALE)
    bin_inv = cv2.bitwise_not(img) # flip image colors
    bin_inv = cv2.dilate(bin_inv, np.ones((5,5)))

    # ========================== FIND END POINTS =====================================
    th, img = cv2.threshold(img, 127, 255, cv2.THRESH_OTSU + cv2.THRESH_BINARY_INV)
    img = cv2.ximgproc.thinning(img)
    pnts = cv2.findNonZero(img)
    pnts = np.squeeze(pnts)
    ext = get_end_pnts(pnts, img)
    for p in ext:
        cv2.circle(img, (p[0], p[1]), 5, 128)

    # =========================== FIND SEGMENTS ========================================
    segments = {}
    count = 0
    lines = itertools.combinations(ext,2) # create all possible lines
    line_img = np.ones_like(img)*255 # white image to draw line markings on
    for line in lines: # loop through each line
        bin_line = np.zeros_like(bin_inv) # create a matrix to draw the line in
        start, end = line # grab endpoints
        cv2.line(bin_line, start, end, color=255, thickness=5) # draw line
        conj = (bin_inv/255 + bin_line/255) # create agreement image
        conj_line = (np.zeros_like(bin_inv) + bin_line/255)
        n_agree = np.sum(conj==2)
        n_line = np.sum(conj_line==1)
        precision = n_agree/n_line
        if precision > .5:
            cv2.line(line_img, start, end, color=[0,200,0], thickness=2)
            segments[count] = {"line": [list(start),list(end)], "precision": precision}
            count += 1

    segments = filter_overlap(segments)
    display_result(img, segments)

    return segments

