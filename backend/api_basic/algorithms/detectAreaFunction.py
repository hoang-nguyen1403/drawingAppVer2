import cv2
import numpy as np
import math
from scipy.spatial import cKDTree


def detectArea(data):
    # =============== GET DATA ============================
    raw_node_coords = data['node_coords']
    segments = data['segments']
    old_surfaces = data['surfaces']
    old_surface_names = data['surface_names']
    old_surface_name_coords = data['surface_coords']

    # =============== GET NAMED SURFACES ============================
    named_surfaces = []
    named_surface_names = []
    named_surface_name_coords = []
    for idx, name in enumerate(old_surface_names):
        if name is not None:
            named_surfaces.append(old_surfaces[idx])
            named_surface_names.append(name)
            named_surface_name_coords.append(old_surface_name_coords[idx])
    
    # ============== TAKE MIN VALUE COORD =============================
    min_x = 10000000
    max_x = -10000000
    min_y = 10000000
    max_y = -10000000
    max_length = -10000000
    min_length = 10000000

    for i in range(len(raw_node_coords)):
        if raw_node_coords[i][0] <= min_x:
            indice_x = raw_node_coords[i][0]
            min_x = indice_x
        if raw_node_coords[i][1] <= min_y:
            indice_y = raw_node_coords[i][1]
            min_y = indice_y
        if raw_node_coords[i][0] >= max_x:
            indice_max_x = raw_node_coords[i][0]
            max_x = indice_max_x
        if raw_node_coords[i][1] >= max_y:
            indice_max_y = raw_node_coords[i][1]
            max_y = indice_max_y

    for segment in segments:
        start_node = raw_node_coords[segment[0]]
        end_node = raw_node_coords[segment[1]]
        lengthline = math.sqrt((start_node[0] - end_node[0]) ** 2 + (start_node[1] - end_node[1]) ** 2)
        if (lengthline > max_length):
            max_length = lengthline
        if (lengthline < min_length):
            min_length = lengthline

    # =============== CREATE MATRIX =============================
    matrix = np.zeros((3600, 3600), 'uint8')
    # =============== SCALE AND ROUND NODE COORDINATES =========================
    scale_node_coords = []
    if (min_length <= math.sqrt(2)):
        scale = 20
        matrix = np.zeros((6500, 6500), 'uint8')
    elif (min_length <= 100) and (min_length > math.sqrt(2)):
        scale = 60
    elif (min_length > 100) and (min_length <= 1000):
        scale = 1 / 2
    elif (min_length > 1000):
        scale = 1 / 10
    else:
        scale = 1

    if (max_x > matrix.shape[0]):
        scale_node_coords = [[round((x - matrix.shape[0] + min_x + 5) * scale), round((y + abs(min_y) + 5) * scale)] for [x, y] in
         raw_node_coords]
    elif (max_y > matrix.shape[0]):
        scale_node_coords = [[round((x + abs(min_x) + 5) * scale), round((y - matrix.shape[0] + min_y + 5) * scale)] for [x, y] in
         raw_node_coords]
    elif (max_x > matrix.shape[0]) and (max_y > matrix.shape[0]):
        scale_node_coords = [[round((x - matrix.shape[0] + min_x + 5) * scale), round((y - matrix.shape[0] + min_y + 5) * scale)] for
         [x, y] in raw_node_coords]
    elif (min_x < 0 and min_y < 0):
        scale_node_coords = [[round((x + abs(min_x) + 5) * scale), round((y + abs(min_y) + 5) * scale)] for [x, y] in raw_node_coords]
    elif (min_x < 0):
        scale_node_coords = [[round((x + abs(min_x) + 5) * scale), round((y + 5) * scale)] for [x, y] in raw_node_coords]
    elif (min_y < 0):
        scale_node_coords = [[round((x + 5) * scale), round((y + abs(min_y) + 5) * scale)] for [x, y] in raw_node_coords]
    else:
        scale_node_coords = [[round((x + 5) * scale), round((y + 5) * scale)] for [x, y] in raw_node_coords]

    rescale_node_coords = []

    min_x = 10000000
    max_x = -10000000
    min_y = 10000000
    max_y = -10000000

    for i in range(len(scale_node_coords)):
        if scale_node_coords[i][0] <= min_x:
            indice_x = scale_node_coords[i][0]
            min_x = indice_x
        if scale_node_coords[i][1] <= min_y:
            indice_y = scale_node_coords[i][1]
            min_y = indice_y
        if scale_node_coords[i][0] >= max_x:
            indice_max_x = scale_node_coords[i][0]
            max_x = indice_max_x
        if scale_node_coords[i][1] >= max_y:
            indice_max_y = scale_node_coords[i][1]
            max_y = indice_max_y

    if (max_x > matrix.shape[0]) or (max_y > matrix.shape[0]):
        rescale_node_coords = [[round(x - min_x + 5), round(y - min_y + 5)] for [x, y] in scale_node_coords]
        scale_node_coords = rescale_node_coords

    min_x = 10000000
    max_x = -10000000
    min_y = 10000000
    max_y = -10000000

    for i in range(len(rescale_node_coords)):
        if rescale_node_coords[i][0] <= min_x:
            indice_x = rescale_node_coords[i][0]
            min_x = indice_x
        if rescale_node_coords[i][1] <= min_y:
            indice_y = rescale_node_coords[i][1]
            min_y = indice_y
        if rescale_node_coords[i][0] >= max_x:
            indice_max_x = rescale_node_coords[i][0]
            max_x = indice_max_x
        if rescale_node_coords[i][1] >= max_y:
            indice_max_y = rescale_node_coords[i][1]
            max_y = indice_max_y
    length_x = max_x - min_x
    length_y = max_y - min_y

    current_matrix_length = matrix.shape[0]
    if (min_x + length_x > matrix.shape[0]) and (min_y + length_y > matrix.shape[0]):
        matrix = np.zeros((round(min_y + length_y + 1000), round(min_x + length_x + 1000)), 'uint8')
    elif (min_y + length_y > matrix.shape[1]):
        matrix = np.zeros((round(min_y + length_y + 1000), current_matrix_length), 'uint8')
    elif (min_x + length_x > matrix.shape[0]):
        matrix = np.zeros((current_matrix_length, round(min_x + length_x + 1000)), 'uint8')
    kdtree = cKDTree(scale_node_coords)

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
    surfaces = []
    surface_names = []
    surface_name_coords = []

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

        sort_surfaces = [sorted(surface) for surface in surfaces]
        if len(list(dict.fromkeys(surface_nodes))) >= 3 and sorted(list(dict.fromkeys(surface_nodes))) not in sort_surfaces:
            surfaces.append(list(dict.fromkeys(surface_nodes)))
            surface_name = None
            surface_name_coord = None
            for idx, named_surface in enumerate(named_surfaces):
                if sorted(list(dict.fromkeys(surface_nodes))) == sorted(named_surface):
                    surface_name = named_surface_names[idx]
                    surface_name_coord = named_surface_name_coords[idx]
            surface_names.append(surface_name)
            surface_name_coords.append(surface_name_coord)
        surface_nodes = []
        # surface_segments = []
        # surface_nodes_copy = []
    data['surfaces'] = surfaces
    data['surface_names'] = surface_names
    data['surface_coords'] = surface_name_coords
    return data

