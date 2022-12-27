function  mps_PALc(pname, params) {
    let bodyData = {
        rhs: [pname, params],
        nargout: 1,
        outputFormat: { mode: "small", nanType: "object" },
    };

    let promise = axios({
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
        url: "http://localhost:5902/matfun/mps_PAL",
        data: bodyData,
    });
    promise.then((result) => {
        console.log(result)
    });

    promise.catch(function (err) {
        console.log("err", err);
    });
}

// import axios from 'axios';
// import fs from 'fs';

// function mps_PALc(pname, params) {
//     //bodyData: data will send to server
//     //params: list data - stringified JSON form
//     let bodyData = {
//         rhs: [pname, params],
//         nargout: 1,
//         outputFormat: { mode: "small", nanType: "object" },
//     };

//     let promise = axios({
//         headers: {
//             "Content-Type": "application/json",
//         },
//         method: "POST",
//         url: "http://34.23.153.57:5902/matfun/mps_PAL",
//         data: bodyData,
//     });

//     promise.then((result) => {
//         let json = JSON.stringify(result.data);
//         fs.writeFile ("result.json", json, function(err) {
//             if (err) throw err;
//             console.log('complete');
//             }
//         );
//     });

//     promise.catch(function (err) {
//         console.log("err", err);
//     });

//     promise.then((result) => {
//         console.log(result)
//     });
// }

// let params = {
//     "num_nodes": 3,
//     "num_segments": 3,
//     "node_coords": [
//         [
//             165,
//             248
//         ],
//         [
//             278,
//             106
//         ],
//         [
//             381,
//             247
//         ]
//     ],
//     "node_names": [
//         null,
//         null,
//         null
//     ],
//     "segments": [
//         [
//             0,
//             1
//         ],
//         [
//             1,
//             2
//         ],
//         [
//             2,
//             0
//         ]
//     ],
//     "segment_names": [
//         null,
//         null,
//         null
//     ],
//     "surfaces": [],
//     "surface_names": [],
//     "nodal_loads": [
//         null,
//         null,
//         null
//     ],
//     "segment_loads": [
//         null,
//         null,
//         null
//     ],
//     "text-data": []
// };

// let params_str=JSON.stringify(params);
// mps_PALc("phi_custom", params_str);
