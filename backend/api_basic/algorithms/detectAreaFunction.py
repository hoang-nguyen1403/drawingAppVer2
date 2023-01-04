import cv2
import numpy as np
from scipy.spatial import cKDTree


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
    # mask used to flood filling
    h, w = im_th.shape[:2] # notice the size needs to be 2 pixels than the image.
    mask = np.zeros((h+2, w+2), np.uint8)
    cv2.floodFill(matrix, mask, (0,0), 255) # floodfill from point (0, 0)
    matrix = cv2.bitwise_not(matrix) # invert foolfilled image

    # =============== FIND CONTOURS =============================
    contours, _ = cv2.findContours(matrix, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    surface_nodes = [] # list of nodes that make a surface
    # surface_segments = [] # list of segments that make a surface
    surfaces = [] # list of many surfaces

    # =============== FIND WHICH NODES THAT MAKE A SURFACE =============================
    for contour in contours:
        approx = cv2.approxPolyDP(contour, 0.009 * cv2.arcLength(contour, True), True)

        #convert array to list
        contour_list = approx.ravel()

        for i in range(0,len(contour_list)):
            if i % 2 == 0:
                x = contour_list[i]
                y = contour_list[i+1]
                distances, ids = kdtree.query([x, y])
                surface_nodes.append(ids)

    # =============== FIND WHICH SEGMENTS THAT MAKE A SURFACE FROM THOSE NODES =============================
        # surface_nodes_copy = surface_nodes.copy()
        # surface_nodes_copy.append(surface_nodes[0])
        
        # for i in range(0, len(surface_nodes)):
        #     segment1 = [surface_nodes_copy[i], surface_nodes_copy[i+1]]
        #     segment2 = [surface_nodes_copy[i+1], surface_nodes_copy[i]]
        #     for j in range(0, len(segments)):
        #         if segment1 == segments[j] or segment2 == segments[j]:
        #             surface_segments.append(j)
        #             break

        all_surfaces = data['surfaces'] + surfaces
        sort_surfaces = [sorted(surface) for surface in all_surfaces]
        if len(surface_nodes) >= 3 and sorted(surface_nodes) not in sort_surfaces:
            surfaces.append(surface_nodes)
        surface_nodes = []
        # surface_segments = []
        # surface_nodes_copy = []
    
    data['surfaces'] += surfaces
    data['surface_names'] += [None]*len(surfaces)
    # print(data)
    return data