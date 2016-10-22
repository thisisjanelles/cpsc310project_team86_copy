/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets, default as DatasetController} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";

import {expect} from 'chai';
describe("QueryController", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to validate a valid query", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(true);
    });

    // it("Should be able to invalidate an invalid query", function () {
    //     let query: any = [];
    //     let dataset: Datasets = {};
    //     let controller = new QueryController(dataset);
    //     let isValid = controller.isValid(query);
    //
    //     expect(isValid).to.equal(false);
    // });

    it("Should be able to invalidate an invalid query for AS", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept"],
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": "n"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    // it("Should be able to invalidate an invalid query for ORDER", function () {
    //     // NOTE: this is not actually a valid query for D1
    //     let query: QueryRequest = {
    //         "GET": ["courses_dept"],
    //         "WHERE": {
    //             "GT": {
    //                 "courses_avg": 90
    //             }
    //         },
    //         "ORDER": "courses_avg",
    //         "AS": "TABLE"
    //     };
    //     let dataset: Datasets = {};
    //     let controller = new QueryController(dataset);
    //     let isValid = controller.isValid(query);
    //
    //     expect(isValid).to.equal(false);
    // });

    it("Should be able to query, although the answer will be empty", function () {
        // NOTE: this is not actually a valid query for D1, nor is the result correct.
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"GT": {"courses_avg": 200}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        // should check that the value is meaningful
    });

    it("Should be able to query with ORDER", function () {
        // NOTE: this is not actually a valid query for D1, nor is the result correct.
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            // "ORDER": "courses_id",
            "AS": "TABLE"
        };

        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult = {"render":"TABLE","result":[{"courses_id":"261","courseAverage":68.41},
            {"courses_id":"320","courseAverage":70.61},{"courses_id":"415","courseAverage":70.72},
            {"courses_id":"420","courseAverage":71.57},{"courses_id":"317","courseAverage":72.09},
            {"courses_id":"322","courseAverage":73.47},{"courses_id":"404","courseAverage":73.47},
            {"courses_id":"303","courseAverage":73.55},{"courses_id":"340","courseAverage":73.55},
            {"courses_id":"210","courseAverage":74.08},{"courses_id":"313","courseAverage":74.15},
            {"courses_id":"422","courseAverage":74.15},{"courses_id":"425","courseAverage":74.16},
            {"courses_id":"213","courseAverage":74.37},{"courses_id":"110","courseAverage":74.61},
            {"courses_id":"416","courseAverage":74.8},{"courses_id":"259","courseAverage":74.98},
            {"courses_id":"221","courseAverage":75.08},{"courses_id":"302","courseAverage":76.2},
            {"courses_id":"121","courseAverage":76.24},{"courses_id":"314","courseAverage":76.71},
            {"courses_id":"421","courseAverage":76.83},{"courses_id":"304","courseAverage":76.86},
            {"courses_id":"311","courseAverage":77.17},{"courses_id":"410","courseAverage":77.61},
            {"courses_id":"418","courseAverage":77.74},{"courses_id":"430","courseAverage":77.77},
            {"courses_id":"310","courseAverage":78.06},{"courses_id":"344","courseAverage":79.05},
            {"courses_id":"444","courseAverage":79.19},{"courses_id":"411","courseAverage":79.34},
            {"courses_id":"515","courseAverage":81.02},{"courses_id":"513","courseAverage":81.5},
            {"courses_id":"445","courseAverage":81.61},{"courses_id":"301","courseAverage":81.64},
            {"courses_id":"312","courseAverage":81.81},{"courses_id":"502","courseAverage":83.22},
            {"courses_id":"527","courseAverage":83.78},{"courses_id":"500","courseAverage":83.95},
            {"courses_id":"319","courseAverage":84.15},{"courses_id":"544","courseAverage":84.25},
            {"courses_id":"521","courseAverage":84.86},{"courses_id":"509","courseAverage":85.72},
            {"courses_id":"522","courseAverage":85.75},{"courses_id":"589","courseAverage":85.82},
            {"courses_id":"540","courseAverage":86.46},{"courses_id":"543","courseAverage":87.32},
            {"courses_id":"503","courseAverage":88.43},{"courses_id":"547","courseAverage":88.47},
            {"courses_id":"507","courseAverage":88.57},{"courses_id":"501","courseAverage":90.21},
            {"courses_id":"490","courseAverage":90.73},{"courses_id":"449","courseAverage":92.1}]};
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret).to.be.equal(expectedResult);
        // should check that the value is meaningful
    });
});
