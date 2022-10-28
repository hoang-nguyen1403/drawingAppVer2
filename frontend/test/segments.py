import json
import cv2
import numpy as np

def drawBoundingRect(contour):
    # get the min area rect
    rect = cv2.minAreaRect(contour)
    box = cv2.boxPoints(rect)
    box = np.int0(box) #convert all coordinates floating point value to int
    # draw all contours
    cv2.drawContours(img, [box], 0, (200, 200, 200), 1)

# img = cv2.imread("C:\\MyFolder\\Python\\openCVweb\\blank.png",2)
img = np.zeros((3000, 3000), 'uint8')

#read json file
with open('data3.json','r') as data_file:
    python_dictionary = json.loads(data_file.read())

# get node_coords and segments
raw_node_coords = python_dictionary['node_coords']
segments = python_dictionary['segments']
scale = 2
# round node_coords
node_coords = [[round(x*scale),round(y*scale)] for [x,y] in raw_node_coords]

# draw segments
for segment in segments:
    start_node = node_coords[segment[0]]
    end_node = node_coords[segment[1]]
    cv2.line(img, start_node, end_node,(255,0,0),2)

# threshold binary
th, im_th = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY_INV)

# mask used to flood filling
# notice the size needs to be 2 pixels than the image.
h, w = im_th.shape[:2]
mask = np.zeros((h+2, w+2), np.uint8)
# floodfill from point (0, 0)
cv2.floodFill(img, mask, (0,0), 255)
# invert foolfilled image
img = cv2.bitwise_not(img)

contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

count = 1
# areas = []
surface_node = []
surface_segment = []
surface_list = []
for contour in contours:
    approx = cv2.approxPolyDP(contour, 0.009 * cv2.arcLength(contour, True), True)
    # # cv2.drawContours(img, [contour], 0, (100,100,255),1)
    # drawBoundingRect(contour)
    # M = cv2.moments(contour)
    # if M['m00'] != 0.0:
    #     xM = int(M['m10']/M['m00'])
    #     yM = int(M['m01']/M['m00']) 
    # cv2.putText(img, str(count), (xM, yM), cv2.FONT_HERSHEY_SIMPLEX, 1, (100, 255, 255), 1, cv2.LINE_AA)
    # areas.append(cv2.contourArea(contour))

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
                    true_node = num_node #node which have the smallest data is the most correct point
            surface_node.append(true_node)
    
    surface_node.append(surface_node[0])
    for i in range(0, len(surface_node)-1):
        segment1 = [surface_node[i], surface_node[i+1]]
        segment2 = [surface_node[i+1], surface_node[i]]
        for j in range(0, len(segments)):
            if segment1 == segments[j] or segment2 == segments[j]:
                surface_segment.append(j)
                break
    
    # surface_segment = set(surface_segment)
    if len(surface_segment) < 3:
        print("error surface: ", count)
    # print('node',surface_node)
    print('surface',count, surface_segment)
    if surface_segment != []:
        surface_list.append(surface_segment)
    # print('surface_list',surface_list)
    surface_node = []
    surface_segment = []
    count += 1

python_dictionary['surfaces'] = surface_list
print(python_dictionary)
json_str = json.dumps(python_dictionary)
with open("result.json", "w") as result_file:
    result_file.write(json_str)
# print("number of shapes:", len(contours))

# Displaying the image
cv2.imshow("drawing", img)
cv2.waitKey(0)
cv2.destroyAllWindows()