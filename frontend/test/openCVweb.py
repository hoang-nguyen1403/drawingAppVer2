import json
import cv2
import numpy as np

# img = cv2.imread("C:\\MyFolder\\Python\\openCVweb\\blank.png",2)
img = np.zeros((600, 600), 'uint8')

with open('data.json','r') as json_file:
    python_dictionary = json.loads(json_file.read())

raw_node_coords = python_dictionary['node_coords']
segments = python_dictionary['segments']

node_coords = [[round(x),round(y)] for [x,y] in raw_node_coords]
print(node_coords)

for segment in segments:
    start_point = node_coords[segment[0]]
    end_point = node_coords[segment[1]]
    cv2.line(img, start_point, end_point,(255,0,0),1)
    
th, im_th = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY_INV)
h, w = im_th.shape[:2]
mask = np.zeros((h+2, w+2), np.uint8)
cv2.floodFill(img, mask, (0,0), 255)
img = cv2.bitwise_not(img)

contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
i = 0
count = 0
for contour in contours:
    if i == 0:
        i = 1
        continue
    cv2.drawContour(img, [contour], 0, (0,0,255),1)
    M = cv2.moments(contour)
    if M['m00'] != 0.0:
        xM = int(M['m10']/M['m00'])
        yM = int(M['m01']/M['m00'])
    cv2.putText(img, 'Triangle', (xM, yM), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 1)
    count += 1
    

print("number of shapes: ", len(contours))
print("number of shapes: ", count)

# Displaying the image
cv2.imshow("drawing", img)
cv2.waitKey(0)
cv2.destroyAllWindows()