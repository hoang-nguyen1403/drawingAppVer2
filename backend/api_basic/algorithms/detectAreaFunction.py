import cv2
import numpy as np
from scipy.spatial import cKDTree


def detectArea(data):
    # =============== GET NODE COORDINATES AND SEGMENTS ============================
    raw_node_coords = data['node_coords']
    segments = data['segments']

    # =============== SCALE AND ROUND NODE COORDINATES =========================
    scale = 4
    node_coords = [[round(x*scale),round(y*scale)] for [x,y] in raw_node_coords]
    kdtree = cKDTree(scale_node_coords)

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
    surfaces = [] # list of many surfaces

    # =============== FIND WHICH NODES THAT MAKE A SURFACE =============================
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