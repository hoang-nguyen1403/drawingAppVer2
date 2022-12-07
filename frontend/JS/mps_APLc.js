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