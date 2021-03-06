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
        this.timeout(1000);
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

    it("Should be an invalid query - all keys in group not in get", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_id", "courses_instructor" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Should be a valid query - all keys correct", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(true);
    });

    it("Should be able an invalid query for - all GROUP not in GET", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Should be a valid query for empty apply", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept"],
            "WHERE": {},
            "GROUP": ["courses_dept"],
            "APPLY": [],
            "ORDER": {"dir": "UP", "keys": ["courses_dept"]},
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(true);
    });


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

    it("Should invalidate query with GROUP length 0", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"LT": {"courses_avg": 90}},
            "GROUP": [],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Should invalidate query with no GROUP", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"NOT": {"courses_dept": "cpsc"}}},
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Should invalidate query with APPLY undefined", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"courses_dept": "cpsc"},
            "GROUP": ["courses_id"],
            "APPLY": ['undefined'],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Firefly: a query ORDER by a key not in GET should not be valid", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"courses_dept": "cpsc"},
            "GROUP": ["courses_id"],
            "APPLY": ['undefined'],
            "ORDER": { "dir": "UP", "keys": ["courses_avg", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Kryptonite: All keys in GROUP should be present in GET", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"courses_dept": "cpsc"},
            "GROUP": ["courses_dept", "courses_id"],
            "APPLY": ['undefined'],
            "ORDER": { "dir": "UP", "keys": ["courses_avg", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Should be able to query, although the answer will be empty", function () {
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

    it("Should be valid LT query", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"LT": {"courses_avg": 200}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
    });

    it("Should be valid NOT query", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"IS": {"NOT": {"courses_dept": "cpsc"}}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret.toString()).to.not.include('cpsc');
    });

    it("Should be able to calculate MIN", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"MIN": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
    });

    // it("Duraflame: sorting by courses_dept should be supported", function () {
    //     let query: QueryRequest = {
    //         "GET": ["courses_id", "courses_dept"],
    //         "WHERE": {"EQ": {"courses_avg": 90}},
    //         "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_id"]},
    //         "AS": "TABLE"
    //     };
    //     let datasetController = new DatasetController();
    //     let datasets: Datasets = datasetController.getDatasets();
    //     let controller = new QueryController(datasets);
    //     let ret = controller.query(query);
    //     let expectedResult =
    //     {render: 'TABLE',
    //         result:
    //             [{courses_dept: "apsc", courses_id: 279},
    //                 {courses_dept: "arch", courses_id: 598},
    //                 {courses_dept: "arch", courses_id: 598},
    //                 {courses_dept: "arth", courses_id: 599},
    //                 {courses_dept: "arth", courses_id: 599},
    //                 {courses_dept: "arth", courses_id: 599},
    //                 {courses_dept: "arth", courses_id: 599},
    //                 {courses_dept: "audi", courses_id: 515},
    //                 {courses_dept: "audi", courses_id: 515},
    //                 {courses_dept: "ceen", courses_id: 596},
    //                 {courses_dept: "chem", courses_id: 407},
    //                 {courses_dept: "chem", courses_id: 407},
    //                 {courses_dept: "chil", courses_id: 599},
    //                 {courses_dept: "chil", courses_id: 599},
    //                 {courses_dept: "crwr", courses_id: 599}]};
    //     Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
    //     expect(ret).not.to.be.equal(null);
    //     expect(JSON.stringify(ret)).to.contain(JSON.stringify(expectedResult));
    // });

    it("Should be able to query with OLD QUERY EXAMPLE 1", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"GT": {"courses_avg": 90}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };

        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult =
        { render: 'TABLE',
            result:
                [ { courses_dept: 'cnps', courses_avg: 90.02 },
                    { courses_dept: 'dhyg', courses_avg: 90.03 },
                    { courses_dept: 'epse', courses_avg: 90.03 },
                    { courses_dept: 'epse', courses_avg: 90.05 },
                    { courses_dept: 'kin', courses_avg: 90.05 },
                    { courses_dept: 'kin', courses_avg: 90.05 },
                    { courses_dept: 'epse', courses_avg: 90.05 },
                    { courses_dept: 'edcp', courses_avg: 90.06 },
                    { courses_dept: 'civl', courses_avg: 90.06 },
                    { courses_dept: 'edst', courses_avg: 90.06 },
                    { courses_dept: 'nurs', courses_avg: 90.06 },
                    { courses_dept: 'edst', courses_avg: 90.06 },
                    { courses_dept: 'civl', courses_avg: 90.06 },
                    { courses_dept: 'sowk', courses_avg: 90.06 },
                    { courses_dept: 'edst', courses_avg: 90.06 },
                    { courses_dept: 'edst', courses_avg: 90.06 },
                    { courses_dept: 'sowk', courses_avg: 90.06 },
                    { courses_dept: 'psyc', courses_avg: 90.06 },
                    { courses_dept: 'psyc', courses_avg: 90.06 },
                    { courses_dept: 'cnps', courses_avg: 90.06 },
                    { courses_dept: 'cnps', courses_avg: 90.06 },
                    { courses_dept: 'edcp', courses_avg: 90.06 },
                    { courses_dept: 'nurs', courses_avg: 90.06 },
                    { courses_dept: 'cnps', courses_avg: 90.07 },
                    { courses_dept: 'epse', courses_avg: 90.07 },
                    { courses_dept: 'pcth', courses_avg: 90.07 },
                    { courses_dept: 'educ', courses_avg: 90.07 },
                    { courses_dept: 'eece', courses_avg: 90.07 },
                    { courses_dept: 'eece', courses_avg: 90.07 },
                    { courses_dept: 'pcth', courses_avg: 90.07 },
                    { courses_dept: 'epse', courses_avg: 90.07 },
                    { courses_dept: 'nurs', courses_avg: 90.07 },
                    { courses_dept: 'nurs', courses_avg: 90.07 },
                    { courses_dept: 'epse', courses_avg: 90.07 },
                    { courses_dept: 'eece', courses_avg: 90.07 },
                    { courses_dept: 'econ', courses_avg: 90.07 },
                    { courses_dept: 'econ', courses_avg: 90.07 },
                    { courses_dept: 'eece', courses_avg: 90.07 },
                    { courses_dept: 'eosc', courses_avg: 90.08 },
                    { courses_dept: 'epse', courses_avg: 90.08 },
                    { courses_dept: 'etec', courses_avg: 90.08 },
                    { courses_dept: 'dhyg', courses_avg: 90.08 },
                    { courses_dept: 'plan', courses_avg: 90.08 },
                    { courses_dept: 'plan', courses_avg: 90.08 },
                    { courses_dept: 'dhyg', courses_avg: 90.08 },
                    { courses_dept: 'etec', courses_avg: 90.09 },
                    { courses_dept: 'epse', courses_avg: 90.09 },
                    { courses_dept: 'bioc', courses_avg: 90.1 },
                    { courses_dept: 'bioc', courses_avg: 90.1 },
                    { courses_dept: 'epse', courses_avg: 90.1 },
                    { courses_dept: 'lled', courses_avg: 90.1 },
                    { courses_dept: 'phar', courses_avg: 90.1 },
                    { courses_dept: 'phar', courses_avg: 90.1 },
                    { courses_dept: 'cons', courses_avg: 90.1 },
                    { courses_dept: 'etec', courses_avg: 90.1 },
                    { courses_dept: 'etec', courses_avg: 90.1 },
                    { courses_dept: 'cons', courses_avg: 90.1 },
                    { courses_dept: 'civl', courses_avg: 90.11 },
                    { courses_dept: 'civl', courses_avg: 90.11 },
                    { courses_dept: 'audi', courses_avg: 90.11 },
                    { courses_dept: 'spph', courses_avg: 90.11 },
                    { courses_dept: 'edcp', courses_avg: 90.11 },
                    { courses_dept: 'path', courses_avg: 90.11 },
                    { courses_dept: 'audi', courses_avg: 90.11 },
                    { courses_dept: 'epse', courses_avg: 90.11 },
                    { courses_dept: 'epse', courses_avg: 90.11 },
                    { courses_dept: 'audi', courses_avg: 90.12 },
                    { courses_dept: 'audi', courses_avg: 90.12 },
                    { courses_dept: 'cnps', courses_avg: 90.12 },
                    { courses_dept: 'surg', courses_avg: 90.13 },
                    { courses_dept: 'sowk', courses_avg: 90.13 },
                    { courses_dept: 'surg', courses_avg: 90.13 },
                    { courses_dept: 'sowk', courses_avg: 90.13 },
                    { courses_dept: 'econ', courses_avg: 90.13 },
                    { courses_dept: 'medg', courses_avg: 90.13 },
                    { courses_dept: 'econ', courses_avg: 90.13 },
                    { courses_dept: 'medg', courses_avg: 90.13 },
                    { courses_dept: 'educ', courses_avg: 90.14 },
                    { courses_dept: 'edcp', courses_avg: 90.14 },
                    { courses_dept: 'edcp', courses_avg: 90.14 },
                    { courses_dept: 'thtr', courses_avg: 90.14 },
                    { courses_dept: 'etec', courses_avg: 90.14 },
                    { courses_dept: 'mtrl', courses_avg: 90.14 },
                    { courses_dept: 'kin', courses_avg: 90.14 },
                    { courses_dept: 'thtr', courses_avg: 90.14 },
                    { courses_dept: 'mtrl', courses_avg: 90.14 },
                    { courses_dept: 'phar', courses_avg: 90.15 },
                    { courses_dept: 'phar', courses_avg: 90.15 },
                    { courses_dept: 'phar', courses_avg: 90.15 },
                    { courses_dept: 'phar', courses_avg: 90.15 },
                    { courses_dept: 'epse', courses_avg: 90.15 },
                    { courses_dept: 'eosc', courses_avg: 90.15 },
                    { courses_dept: 'eosc', courses_avg: 90.15 },
                    { courses_dept: 'econ', courses_avg: 90.17 },
                    { courses_dept: 'mech', courses_avg: 90.17 },
                    { courses_dept: 'adhe', courses_avg: 90.17 },
                    { courses_dept: 'biol', courses_avg: 90.17 },
                    { courses_dept: 'biol', courses_avg: 90.17 },
                    { courses_dept: 'russ', courses_avg: 90.17 },
                    { courses_dept: 'mech', courses_avg: 90.17 }]};
        let expectedResultString = expectedResult.toString();
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret.toString()).to.contain(expectedResultString);
    });

    it("Should be able to query with OLD QUERY EXAMPLE 2", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "adhe"}}
                    ]},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };

        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult =
        { render: 'TABLE',
            result:
                [ { courses_dept: 'adhe', courses_id: '412', courses_avg: 70.53 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 70.53 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 70.56 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 72.29 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 72.93 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 73.79 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 75.67 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 75.68 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 75.91 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 76.17 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 76.22 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 76.59 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 76.63 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 77 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 77.28 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 77.42 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 77.5 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 77.58 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 77.58 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 77.59 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 77.77 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 78 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 78.21 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 78.24 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 78.41 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 78.57 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 78.77 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 78.81 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 78.81 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 78.85 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 78.9 },
                    { courses_dept: 'adhe', courses_id: '328', courses_avg: 78.91 },
                    { courses_dept: 'adhe', courses_id: '328', courses_avg: 78.91 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 79 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 79.19 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 79.47 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 79.5 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 79.83 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 80.25 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 80.33 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 80.4 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 80.44 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 80.55 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 80.76 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 81.45 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 81.45 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 81.62 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 81.67 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 81.71 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 81.85 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 81.89 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 82 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 82.49 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 82.73 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 82.76 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 82.78 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 82.81 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 83.02 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 83.05 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.07 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 83.16 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 83.29 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 83.34 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.41 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 83.45 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 83.45 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.47 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.57 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 83.64 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 83.68 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 83.69 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.71 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 83.74 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.83 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 83.9 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 84 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 84.04 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 84.07 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 84.14 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 84.3 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 84.52 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 84.57 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 84.78 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 84.87 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 84.9 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85.04 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 85.04 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85.06 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 85.12 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85.2 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 85.29 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 85.39 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 85.6 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 85.7 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85.72 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85.8 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 85.8 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 85.81 },
                    { courses_dept: 'adhe', courses_id: '327', courses_avg: 85.81 }]};
        let expectedResultString = expectedResult.toString();
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret.toString()).to.contain(expectedResultString);
    });


    it("Should be able to query with QUERY EXAMPLE 1", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult = {"render":"TABLE","result":[{"courses_id":"261","courseAverage":68.41},{"courses_id":"320","courseAverage":70.61},{"courses_id":"415","courseAverage":70.72},{"courses_id":"420","courseAverage":71.57},{"courses_id":"317","courseAverage":72.09},{"courses_id":"322","courseAverage":73.47},{"courses_id":"404","courseAverage":73.47},{"courses_id":"303","courseAverage":73.55},{"courses_id":"340","courseAverage":73.55},{"courses_id":"210","courseAverage":74.08},{"courses_id":"313","courseAverage":74.15},{"courses_id":"422","courseAverage":74.15},{"courses_id":"425","courseAverage":74.16},{"courses_id":"213","courseAverage":74.37},{"courses_id":"110","courseAverage":74.61},{"courses_id":"416","courseAverage":74.8},{"courses_id":"259","courseAverage":74.98},{"courses_id":"221","courseAverage":75.08},{"courses_id":"302","courseAverage":76.2},{"courses_id":"121","courseAverage":76.24},{"courses_id":"314","courseAverage":76.71},{"courses_id":"421","courseAverage":76.83},{"courses_id":"304","courseAverage":76.86},{"courses_id":"311","courseAverage":77.17},{"courses_id":"410","courseAverage":77.61},{"courses_id":"418","courseAverage":77.74},{"courses_id":"430","courseAverage":77.77},{"courses_id":"310","courseAverage":78.06},{"courses_id":"344","courseAverage":79.05},{"courses_id":"444","courseAverage":79.19},{"courses_id":"411","courseAverage":79.34},{"courses_id":"515","courseAverage":81.02},{"courses_id":"513","courseAverage":81.5},{"courses_id":"445","courseAverage":81.61},{"courses_id":"301","courseAverage":81.64},{"courses_id":"312","courseAverage":81.81},{"courses_id":"502","courseAverage":83.22},{"courses_id":"527","courseAverage":83.78},{"courses_id":"500","courseAverage":83.95},{"courses_id":"319","courseAverage":84.15},{"courses_id":"544","courseAverage":84.25},{"courses_id":"521","courseAverage":84.86},{"courses_id":"509","courseAverage":85.72},{"courses_id":"522","courseAverage":85.75},{"courses_id":"589","courseAverage":85.82},{"courses_id":"540","courseAverage":86.46},{"courses_id":"543","courseAverage":87.32},{"courses_id":"503","courseAverage":88.43},{"courses_id":"547","courseAverage":88.47},{"courses_id":"507","courseAverage":88.57},{"courses_id":"501","courseAverage":90.21},{"courses_id":"490","courseAverage":90.73},{"courses_id":"449","courseAverage":92.1}]};
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });

    it("Should be able to query QUERY EXAMPLE 2", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult = {"render":"TABLE","result":[{"courses_dept":"wood","courses_id":"475","courseAverage":52.83,"maxFail":2},{"courses_dept":"busi","courses_id":"398","courseAverage":57.92,"maxFail":12},{"courses_dept":"busi","courses_id":"460","courseAverage":57.96,"maxFail":13},{"courses_dept":"test","courses_id":"100","courseAverage":60,"maxFail":0},{"courses_dept":"busi","courses_id":"344","courseAverage":60.04,"maxFail":36},{"courses_dept":"chbe","courses_id":"477","courseAverage":61.22,"maxFail":6},{"courses_dept":"math","courses_id":"180","courseAverage":61.55,"maxFail":94},{"courses_dept":"math","courses_id":"110","courseAverage":62.09,"maxFail":73},{"courses_dept":"mtrl","courses_id":"378","courseAverage":62.5,"maxFail":12},{"courses_dept":"busi","courses_id":"121","courseAverage":62.5,"maxFail":52},{"courses_dept":"math","courses_id":"264","courseAverage":62.57,"maxFail":34},{"courses_dept":"math","courses_id":"310","courseAverage":62.95,"maxFail":8},{"courses_dept":"mtrl","courses_id":"365","courseAverage":63.08,"maxFail":7},{"courses_dept":"busi","courses_id":"300","courseAverage":63.34,"maxFail":37},{"courses_dept":"chem","courses_id":"330","courseAverage":63.71,"maxFail":13},{"courses_dept":"thtr","courses_id":"450","courseAverage":63.78,"maxFail":4},{"courses_dept":"busi","courses_id":"331","courseAverage":63.83,"maxFail":44},{"courses_dept":"math","courses_id":"184","courseAverage":64.04,"maxFail":114},{"courses_dept":"chem","courses_id":"260","courseAverage":64.21,"maxFail":19},{"courses_dept":"apbi","courses_id":"351","courseAverage":64.34,"maxFail":5},{"courses_dept":"hist","courses_id":"102","courseAverage":64.38,"maxFail":14},{"courses_dept":"busi","courses_id":"330","courseAverage":64.62,"maxFail":81},{"courses_dept":"math","courses_id":"220","courseAverage":64.99,"maxFail":51},{"courses_dept":"busi","courses_id":"100","courseAverage":65.28,"maxFail":36},{"courses_dept":"math","courses_id":"101","courseAverage":65.38,"maxFail":222},{"courses_dept":"hist","courses_id":"101","courseAverage":65.46,"maxFail":6},{"courses_dept":"epse","courses_id":"171","courseAverage":65.55,"maxFail":0},{"courses_dept":"chem","courses_id":"233","courseAverage":65.71,"maxFail":226},{"courses_dept":"lfs","courses_id":"100","courseAverage":65.74,"maxFail":15},{"courses_dept":"phys","courses_id":"158","courseAverage":65.85,"maxFail":93},{"courses_dept":"phys","courses_id":"157","courseAverage":65.92,"maxFail":65},{"courses_dept":"medg","courses_id":"410","courseAverage":65.97,"maxFail":2},{"courses_dept":"mtrl","courses_id":"263","courseAverage":66.13,"maxFail":6},{"courses_dept":"math","courses_id":"305","courseAverage":66.13,"maxFail":10},{"courses_dept":"math","courses_id":"190","courseAverage":66.13,"maxFail":15},{"courses_dept":"math","courses_id":"152","courseAverage":66.17,"maxFail":112},{"courses_dept":"math","courses_id":"300","courseAverage":66.21,"maxFail":35},{"courses_dept":"wood","courses_id":"282","courseAverage":66.26,"maxFail":4},{"courses_dept":"vant","courses_id":"148","courseAverage":66.36,"maxFail":11},{"courses_dept":"math","courses_id":"105","courseAverage":66.62,"maxFail":170},{"courses_dept":"mtrl","courses_id":"382","courseAverage":66.7,"maxFail":2},{"courses_dept":"mtrl","courses_id":"280","courseAverage":66.7,"maxFail":7},{"courses_dept":"biol","courses_id":"200","courseAverage":66.81,"maxFail":133},{"courses_dept":"comm","courses_id":"293","courseAverage":67.09,"maxFail":102},{"courses_dept":"frst","courses_id":"231","courseAverage":67.13,"maxFail":23},{"courses_dept":"lled","courses_id":"201","courseAverage":67.25,"maxFail":13},{"courses_dept":"geog","courses_id":"122","courseAverage":67.36,"maxFail":37},{"courses_dept":"chem","courses_id":"310","courseAverage":67.38,"maxFail":11},{"courses_dept":"mech","courses_id":"224","courseAverage":67.39,"maxFail":25},{"courses_dept":"busi","courses_id":"445","courseAverage":67.41,"maxFail":13},{"courses_dept":"chem","courses_id":"213","courseAverage":67.42,"maxFail":24},{"courses_dept":"musc","courses_id":"100","courseAverage":67.43,"maxFail":8},{"courses_dept":"busi","courses_id":"444","courseAverage":67.44,"maxFail":6},{"courses_dept":"busi","courses_id":"111","courseAverage":67.45,"maxFail":11},{"courses_dept":"astu","courses_id":"202","courseAverage":67.49,"maxFail":5},{"courses_dept":"asia","courses_id":"377","courseAverage":67.5,"maxFail":2},{"courses_dept":"chem","courses_id":"312","courseAverage":67.51,"maxFail":39},{"courses_dept":"chem","courses_id":"309","courseAverage":67.6,"maxFail":14},{"courses_dept":"psyc","courses_id":"218","courseAverage":67.62,"maxFail":63},{"courses_dept":"geog","courses_id":"380","courseAverage":67.71,"maxFail":5},{"courses_dept":"psyc","courses_id":"320","courseAverage":67.72,"maxFail":33},{"courses_dept":"asia","courses_id":"101","courseAverage":67.75,"maxFail":20},{"courses_dept":"math","courses_id":"200","courseAverage":67.75,"maxFail":107},{"courses_dept":"math","courses_id":"103","courseAverage":67.77,"maxFail":81},{"courses_dept":"chem","courses_id":"250","courseAverage":67.78,"maxFail":14},{"courses_dept":"frst","courses_id":"311","courseAverage":67.79,"maxFail":2},{"courses_dept":"fre","courses_id":"295","courseAverage":67.85,"maxFail":1},{"courses_dept":"musc","courses_id":"121","courseAverage":67.85,"maxFail":13},{"courses_dept":"frst","courses_id":"200","courseAverage":67.86,"maxFail":13},{"courses_dept":"chem","courses_id":"203","courseAverage":67.87,"maxFail":39},{"courses_dept":"chbe","courses_id":"251","courseAverage":67.89,"maxFail":17},{"courses_dept":"mtrl","courses_id":"340","courseAverage":67.9,"maxFail":8},{"courses_dept":"math","courses_id":"303","courseAverage":68.16,"maxFail":11},{"courses_dept":"psyc","courses_id":"208","courseAverage":68.19,"maxFail":44},{"courses_dept":"clst","courses_id":"331","courseAverage":68.23,"maxFail":3},{"courses_dept":"stat","courses_id":"357","courseAverage":68.24,"maxFail":10},{"courses_dept":"eosc","courses_id":"429","courseAverage":68.26,"maxFail":5},{"courses_dept":"chem","courses_id":"311","courseAverage":68.26,"maxFail":26},{"courses_dept":"psyc","courses_id":"207","courseAverage":68.28,"maxFail":49},{"courses_dept":"psyc","courses_id":"101","courseAverage":68.3,"maxFail":175},{"courses_dept":"math","courses_id":"104","courseAverage":68.37,"maxFail":122},{"courses_dept":"biol","courses_id":"351","courseAverage":68.4,"maxFail":7},{"courses_dept":"cpsc","courses_id":"261","courseAverage":68.41,"maxFail":17},{"courses_dept":"chbe","courses_id":"241","courseAverage":68.41,"maxFail":23},{"courses_dept":"math","courses_id":"312","courseAverage":68.42,"maxFail":14},{"courses_dept":"clst","courses_id":"232","courseAverage":68.48,"maxFail":13},{"courses_dept":"comm","courses_id":"100","courseAverage":68.48,"maxFail":14},{"courses_dept":"geog","courses_id":"121","courseAverage":68.48,"maxFail":27},{"courses_dept":"psyc","courses_id":"102","courseAverage":68.49,"maxFail":146},{"courses_dept":"psyc","courses_id":"304","courseAverage":68.51,"maxFail":31},{"courses_dept":"wood","courses_id":"280","courseAverage":68.53,"maxFail":3},{"courses_dept":"math","courses_id":"400","courseAverage":68.53,"maxFail":15},{"courses_dept":"math","courses_id":"317","courseAverage":68.58,"maxFail":37},{"courses_dept":"geob","courses_id":"102","courseAverage":68.63,"maxFail":44},{"courses_dept":"chem","courses_id":"417","courseAverage":68.65,"maxFail":3},{"courses_dept":"psyc","courses_id":"363","courseAverage":68.69,"maxFail":5},{"courses_dept":"econ","courses_id":"102","courseAverage":68.69,"maxFail":187},{"courses_dept":"phys","courses_id":"318","courseAverage":68.73,"maxFail":2},{"courses_dept":"civl","courses_id":"403","courseAverage":68.74,"maxFail":5},{"courses_dept":"mech","courses_id":"375","courseAverage":68.74,"maxFail":34},{"courses_dept":"math","courses_id":"210","courseAverage":68.76,"maxFail":8},{"courses_dept":"asia","courses_id":"100","courseAverage":68.78,"maxFail":16},{"courses_dept":"math","courses_id":"255","courseAverage":68.83,"maxFail":68},{"courses_dept":"math","courses_id":"257","courseAverage":68.87,"maxFail":55},{"courses_dept":"asia","courses_id":"340","courseAverage":68.89,"maxFail":4},{"courses_dept":"mtrl","courses_id":"394","courseAverage":68.94,"maxFail":9},{"courses_dept":"chem","courses_id":"121","courseAverage":68.94,"maxFail":287},{"courses_dept":"educ","courses_id":"172","courseAverage":69,"maxFail":1},{"courses_dept":"mech","courses_id":"280","courseAverage":69,"maxFail":12},{"courses_dept":"mech","courses_id":"225","courseAverage":69.02,"maxFail":36},{"courses_dept":"eosc","courses_id":"373","courseAverage":69.03,"maxFail":13},{"courses_dept":"apsc","courses_id":"278","courseAverage":69.03,"maxFail":42},{"courses_dept":"math","courses_id":"221","courseAverage":69.03,"maxFail":87},{"courses_dept":"chbe","courses_id":"344","courseAverage":69.08,"maxFail":12},{"courses_dept":"cogs","courses_id":"200","courseAverage":69.09,"maxFail":10},{"courses_dept":"busi","courses_id":"443","courseAverage":69.1,"maxFail":20},{"courses_dept":"econ","courses_id":"101","courseAverage":69.12,"maxFail":221},{"courses_dept":"hist","courses_id":"368","courseAverage":69.22,"maxFail":7},{"courses_dept":"psyc","courses_id":"315","courseAverage":69.25,"maxFail":43},{"courses_dept":"biol","courses_id":"121","courseAverage":69.25,"maxFail":162},{"courses_dept":"musc","courses_id":"354","courseAverage":69.28,"maxFail":1},{"courses_dept":"mtrl","courses_id":"252","courseAverage":69.28,"maxFail":5},{"courses_dept":"mdvl","courses_id":"210","courseAverage":69.28,"maxFail":7},{"courses_dept":"geog","courses_id":"327","courseAverage":69.29,"maxFail":5},{"courses_dept":"psyc","courses_id":"331","courseAverage":69.3,"maxFail":16},{"courses_dept":"biol","courses_id":"335","courseAverage":69.33,"maxFail":41},{"courses_dept":"musc","courses_id":"221","courseAverage":69.35,"maxFail":5},{"courses_dept":"psyc","courses_id":"311","courseAverage":69.36,"maxFail":11},{"courses_dept":"psyc","courses_id":"361","courseAverage":69.37,"maxFail":15},{"courses_dept":"math","courses_id":"302","courseAverage":69.37,"maxFail":20},{"courses_dept":"busi","courses_id":"450","courseAverage":69.38,"maxFail":34},{"courses_dept":"geob","courses_id":"103","courseAverage":69.38,"maxFail":56},{"courses_dept":"fopr","courses_id":"388","courseAverage":69.4,"maxFail":1},{"courses_dept":"wood","courses_id":"120","courseAverage":69.41,"maxFail":6},{"courses_dept":"biol","courses_id":"209","courseAverage":69.45,"maxFail":13},{"courses_dept":"biol","courses_id":"111","courseAverage":69.47,"maxFail":21},{"courses_dept":"asia","courses_id":"342","courseAverage":69.49,"maxFail":5},{"courses_dept":"asia","courses_id":"317","courseAverage":69.5,"maxFail":2},{"courses_dept":"econ","courses_id":"351","courseAverage":69.5,"maxFail":7},{"courses_dept":"micb","courses_id":"201","courseAverage":69.54,"maxFail":26},{"courses_dept":"busi","courses_id":"293","courseAverage":69.56,"maxFail":50},{"courses_dept":"caps","courses_id":"301","courseAverage":69.57,"maxFail":28},{"courses_dept":"math","courses_id":"307","courseAverage":69.58,"maxFail":23},{"courses_dept":"bioc","courses_id":"302","courseAverage":69.58,"maxFail":50},{"courses_dept":"chem","courses_id":"154","courseAverage":69.59,"maxFail":91},{"courses_dept":"psyc","courses_id":"217","courseAverage":69.62,"maxFail":23},{"courses_dept":"hist","courses_id":"235","courseAverage":69.63,"maxFail":8},{"courses_dept":"econ","courses_id":"337","courseAverage":69.64,"maxFail":4},{"courses_dept":"phar","courses_id":"435","courseAverage":69.65,"maxFail":3},{"courses_dept":"phil","courses_id":"100","courseAverage":69.68,"maxFail":19},{"courses_dept":"chbe","courses_id":"244","courseAverage":69.71,"maxFail":18},{"courses_dept":"geog","courses_id":"321","courseAverage":69.74,"maxFail":6},{"courses_dept":"law","courses_id":"504","courseAverage":69.75,"maxFail":1},{"courses_dept":"clch","courses_id":"401","courseAverage":69.76,"maxFail":1},{"courses_dept":"math","courses_id":"253","courseAverage":69.77,"maxFail":55},{"courses_dept":"math","courses_id":"321","courseAverage":69.78,"maxFail":5},{"courses_dept":"apbi","courses_id":"244","courseAverage":69.8,"maxFail":3},{"courses_dept":"busi","courses_id":"101","courseAverage":69.83,"maxFail":19},{"courses_dept":"hist","courses_id":"236","courseAverage":69.84,"maxFail":8},{"courses_dept":"math","courses_id":"102","courseAverage":69.85,"maxFail":68},{"courses_dept":"math","courses_id":"340","courseAverage":69.86,"maxFail":18},{"courses_dept":"arcl","courses_id":"140","courseAverage":69.88,"maxFail":1},{"courses_dept":"hist","courses_id":"105","courseAverage":69.9,"maxFail":16},{"courses_dept":"chem","courses_id":"111","courseAverage":69.91,"maxFail":40},{"courses_dept":"frst","courses_id":"210","courseAverage":69.92,"maxFail":9},{"courses_dept":"anth","courses_id":"418","courseAverage":69.97,"maxFail":2},{"courses_dept":"fren","courses_id":"348","courseAverage":69.98,"maxFail":3},{"courses_dept":"clst","courses_id":"332","courseAverage":70,"maxFail":0},{"courses_dept":"japn","courses_id":"151","courseAverage":70,"maxFail":6},{"courses_dept":"psyc","courses_id":"401","courseAverage":70.05,"maxFail":6},{"courses_dept":"hist","courses_id":"256","courseAverage":70.06,"maxFail":1},{"courses_dept":"math","courses_id":"301","courseAverage":70.07,"maxFail":7},{"courses_dept":"asia","courses_id":"371","courseAverage":70.09,"maxFail":7},{"courses_dept":"musc","courses_id":"454","courseAverage":70.1,"maxFail":2},{"courses_dept":"bioc","courses_id":"202","courseAverage":70.13,"maxFail":16},{"courses_dept":"hist","courses_id":"370","courseAverage":70.16,"maxFail":7},{"courses_dept":"fren","courses_id":"349","courseAverage":70.17,"maxFail":3},{"courses_dept":"rmst","courses_id":"222","courseAverage":70.18,"maxFail":4},{"courses_dept":"frst","courses_id":"232","courseAverage":70.18,"maxFail":14},{"courses_dept":"biol","courses_id":"155","courseAverage":70.19,"maxFail":12},{"courses_dept":"musc","courses_id":"201","courseAverage":70.25,"maxFail":8},{"courses_dept":"hist","courses_id":"104","courseAverage":70.25,"maxFail":17},{"courses_dept":"mech","courses_id":"260","courseAverage":70.25,"maxFail":34},{"courses_dept":"phys","courses_id":"216","courseAverage":70.26,"maxFail":8},{"courses_dept":"math","courses_id":"318","courseAverage":70.26,"maxFail":10},{"courses_dept":"kin","courses_id":"190","courseAverage":70.29,"maxFail":17},{"courses_dept":"civl","courses_id":"215","courseAverage":70.29,"maxFail":28},{"courses_dept":"mech","courses_id":"460","courseAverage":70.3,"maxFail":1},{"courses_dept":"busi","courses_id":"355","courseAverage":70.31,"maxFail":30},{"courses_dept":"psyc","courses_id":"336","courseAverage":70.33,"maxFail":5},{"courses_dept":"busi","courses_id":"221","courseAverage":70.33,"maxFail":9},{"courses_dept":"japn","courses_id":"250","courseAverage":70.34,"maxFail":3},{"courses_dept":"chin","courses_id":"461","courseAverage":70.36,"maxFail":0},{"courses_dept":"clst","courses_id":"204","courseAverage":70.37,"maxFail":7},{"courses_dept":"phil","courses_id":"102","courseAverage":70.37,"maxFail":18},{"courses_dept":"geob","courses_id":"204","courseAverage":70.38,"maxFail":4},{"courses_dept":"chem","courses_id":"123","courseAverage":70.38,"maxFail":168},{"courses_dept":"grsj","courses_id":"303","courseAverage":70.39,"maxFail":3},{"courses_dept":"arcl","courses_id":"103","courseAverage":70.42,"maxFail":6},{"courses_dept":"econ","courses_id":"350","courseAverage":70.42,"maxFail":6},{"courses_dept":"econ","courses_id":"441","courseAverage":70.43,"maxFail":11},{"courses_dept":"phar","courses_id":"352","courseAverage":70.47,"maxFail":2},{"courses_dept":"econ","courses_id":"226","courseAverage":70.47,"maxFail":8},{"courses_dept":"psyc","courses_id":"314","courseAverage":70.47,"maxFail":19},{"courses_dept":"wrds","courses_id":"150","courseAverage":70.49,"maxFail":72},{"courses_dept":"asia","courses_id":"351","courseAverage":70.5,"maxFail":1},{"courses_dept":"chem","courses_id":"245","courseAverage":70.5,"maxFail":8},{"courses_dept":"biol","courses_id":"317","courseAverage":70.51,"maxFail":4},{"courses_dept":"asia","courses_id":"337","courseAverage":70.52,"maxFail":4},{"courses_dept":"chbe","courses_id":"456","courseAverage":70.52,"maxFail":4},{"courses_dept":"math","courses_id":"342","courseAverage":70.52,"maxFail":8},{"courses_dept":"mech","courses_id":"360","courseAverage":70.61,"maxFail":22},{"courses_dept":"cpsc","courses_id":"320","courseAverage":70.61,"maxFail":31},{"courses_dept":"mtrl","courses_id":"250","courseAverage":70.62,"maxFail":6},{"courses_dept":"math","courses_id":"320","courseAverage":70.62,"maxFail":7},{"courses_dept":"phil","courses_id":"101","courseAverage":70.62,"maxFail":26},{"courses_dept":"asia","courses_id":"396","courseAverage":70.63,"maxFail":2},{"courses_dept":"busi","courses_id":"441","courseAverage":70.64,"maxFail":3},{"courses_dept":"busi","courses_id":"393","courseAverage":70.64,"maxFail":26},{"courses_dept":"math","courses_id":"215","courseAverage":70.64,"maxFail":67},{"courses_dept":"geog","courses_id":"328","courseAverage":70.66,"maxFail":6},{"courses_dept":"math","courses_id":"100","courseAverage":70.66,"maxFail":91},{"courses_dept":"math","courses_id":"345","courseAverage":70.67,"maxFail":4},{"courses_dept":"stat","courses_id":"443","courseAverage":70.67,"maxFail":4},{"courses_dept":"latn","courses_id":"101","courseAverage":70.67,"maxFail":19},{"courses_dept":"psyc","courses_id":"307","courseAverage":70.68,"maxFail":54},{"courses_dept":"asia","courses_id":"352","courseAverage":70.7,"maxFail":4},{"courses_dept":"eosc","courses_id":"221","courseAverage":70.7,"maxFail":5},{"courses_dept":"geog","courses_id":"211","courseAverage":70.7,"maxFail":9},{"courses_dept":"visa","courses_id":"180","courseAverage":70.71,"maxFail":9},{"courses_dept":"lled","courses_id":"200","courseAverage":70.71,"maxFail":58},{"courses_dept":"cpsc","courses_id":"415","courseAverage":70.72,"maxFail":7},{"courses_dept":"busi","courses_id":"294","courseAverage":70.72,"maxFail":43},{"courses_dept":"civl","courses_id":"210","courseAverage":70.74,"maxFail":24},{"courses_dept":"hist","courses_id":"338","courseAverage":70.75,"maxFail":3},{"courses_dept":"asia","courses_id":"354","courseAverage":70.75,"maxFail":7},{"courses_dept":"span","courses_id":"102","courseAverage":70.76,"maxFail":21},{"courses_dept":"ling","courses_id":"313","courseAverage":70.77,"maxFail":4},{"courses_dept":"chem","courses_id":"304","courseAverage":70.78,"maxFail":18},{"courses_dept":"itst","courses_id":"110","courseAverage":70.79,"maxFail":2},{"courses_dept":"psyc","courses_id":"461","courseAverage":70.8,"maxFail":3},{"courses_dept":"biol","courses_id":"352","courseAverage":70.83,"maxFail":2},{"courses_dept":"hist","courses_id":"356","courseAverage":70.85,"maxFail":4},{"courses_dept":"fopr","courses_id":"362","courseAverage":70.86,"maxFail":6},{"courses_dept":"chbe","courses_id":"351","courseAverage":70.86,"maxFail":12},{"courses_dept":"mine","courses_id":"434","courseAverage":70.88,"maxFail":0},{"courses_dept":"hist","courses_id":"305","courseAverage":70.89,"maxFail":4},{"courses_dept":"geob","courses_id":"200","courseAverage":70.89,"maxFail":5},{"courses_dept":"psyc","courses_id":"302","courseAverage":70.92,"maxFail":31},{"courses_dept":"phil","courses_id":"120","courseAverage":70.92,"maxFail":70},{"courses_dept":"psyc","courses_id":"333","courseAverage":70.94,"maxFail":19},{"courses_dept":"fren","courses_id":"353","courseAverage":70.96,"maxFail":3},{"courses_dept":"chbe","courses_id":"455","courseAverage":70.96,"maxFail":7},{"courses_dept":"fmst","courses_id":"210","courseAverage":70.96,"maxFail":44},{"courses_dept":"japn","courses_id":"251","courseAverage":70.98,"maxFail":1},{"courses_dept":"geob","courses_id":"270","courseAverage":70.98,"maxFail":12},{"courses_dept":"mech","courses_id":"327","courseAverage":70.98,"maxFail":12},{"courses_dept":"biol","courses_id":"230","courseAverage":70.99,"maxFail":32},{"courses_dept":"fren","courses_id":"371","courseAverage":71,"maxFail":5},{"courses_dept":"math","courses_id":"256","courseAverage":71,"maxFail":55},{"courses_dept":"nest","courses_id":"303","courseAverage":71.01,"maxFail":4},{"courses_dept":"mech","courses_id":"222","courseAverage":71.01,"maxFail":22},{"courses_dept":"eosc","courses_id":"116","courseAverage":71.01,"maxFail":27},{"courses_dept":"frst","courses_id":"421","courseAverage":71.03,"maxFail":1},{"courses_dept":"hist","courses_id":"328","courseAverage":71.05,"maxFail":3},{"courses_dept":"busi","courses_id":"370","courseAverage":71.07,"maxFail":35},{"courses_dept":"chem","courses_id":"251","courseAverage":71.08,"maxFail":6},{"courses_dept":"busi","courses_id":"465","courseAverage":71.1,"maxFail":1},{"courses_dept":"astu","courses_id":"201","courseAverage":71.11,"maxFail":1},{"courses_dept":"psyc","courses_id":"358","courseAverage":71.11,"maxFail":7},{"courses_dept":"fmst","courses_id":"312","courseAverage":71.12,"maxFail":14},{"courses_dept":"psyc","courses_id":"321","courseAverage":71.13,"maxFail":3},{"courses_dept":"stat","courses_id":"305","courseAverage":71.15,"maxFail":26},{"courses_dept":"econ","courses_id":"319","courseAverage":71.16,"maxFail":3},{"courses_dept":"caps","courses_id":"391","courseAverage":71.17,"maxFail":27},{"courses_dept":"poli","courses_id":"310","courseAverage":71.22,"maxFail":7},{"courses_dept":"wood","courses_id":"225","courseAverage":71.23,"maxFail":0},{"courses_dept":"grsj","courses_id":"311","courseAverage":71.24,"maxFail":2},{"courses_dept":"hist","courses_id":"419","courseAverage":71.25,"maxFail":3},{"courses_dept":"eosc","courses_id":"329","courseAverage":71.25,"maxFail":8},{"courses_dept":"fren","courses_id":"223","courseAverage":71.26,"maxFail":5},{"courses_dept":"phil","courses_id":"125","courseAverage":71.27,"maxFail":18},{"courses_dept":"math","courses_id":"437","courseAverage":71.29,"maxFail":2},{"courses_dept":"poli","courses_id":"101","courseAverage":71.29,"maxFail":42},{"courses_dept":"civl","courses_id":"406","courseAverage":71.32,"maxFail":5},{"courses_dept":"comm","courses_id":"457","courseAverage":71.33,"maxFail":30},{"courses_dept":"poli","courses_id":"304","courseAverage":71.34,"maxFail":3},{"courses_dept":"eosc","courses_id":"354","courseAverage":71.36,"maxFail":2},{"courses_dept":"musc","courses_id":"220","courseAverage":71.42,"maxFail":5},{"courses_dept":"geog","courses_id":"352","courseAverage":71.42,"maxFail":6},{"courses_dept":"musc","courses_id":"200","courseAverage":71.42,"maxFail":8},{"courses_dept":"biol","courses_id":"112","courseAverage":71.42,"maxFail":150},{"courses_dept":"stat","courses_id":"344","courseAverage":71.45,"maxFail":7},{"courses_dept":"law","courses_id":"507","courseAverage":71.47,"maxFail":2},{"courses_dept":"biol","courses_id":"210","courseAverage":71.47,"maxFail":10},{"courses_dept":"econ","courses_id":"303","courseAverage":71.48,"maxFail":7},{"courses_dept":"eosc","courses_id":"250","courseAverage":71.49,"maxFail":4},{"courses_dept":"anth","courses_id":"215","courseAverage":71.49,"maxFail":5},{"courses_dept":"stat","courses_id":"306","courseAverage":71.49,"maxFail":6},{"courses_dept":"busi","courses_id":"353","courseAverage":71.49,"maxFail":28},{"courses_dept":"wood","courses_id":"241","courseAverage":71.5,"maxFail":0},{"courses_dept":"hebr","courses_id":"102","courseAverage":71.5,"maxFail":1},{"courses_dept":"fren","courses_id":"343","courseAverage":71.51,"maxFail":1},{"courses_dept":"clst","courses_id":"110","courseAverage":71.53,"maxFail":5},{"courses_dept":"ling","courses_id":"201","courseAverage":71.56,"maxFail":16},{"courses_dept":"ital","courses_id":"101","courseAverage":71.56,"maxFail":18},{"courses_dept":"wood","courses_id":"476","courseAverage":71.57,"maxFail":0},{"courses_dept":"geob","courses_id":"300","courseAverage":71.57,"maxFail":2},{"courses_dept":"cpsc","courses_id":"420","courseAverage":71.57,"maxFail":6},{"courses_dept":"clst","courses_id":"318","courseAverage":71.58,"maxFail":3},{"courses_dept":"japn","courses_id":"300","courseAverage":71.58,"maxFail":3},{"courses_dept":"geog","courses_id":"345","courseAverage":71.59,"maxFail":4},{"courses_dept":"japn","courses_id":"150","courseAverage":71.59,"maxFail":7},{"courses_dept":"chbe","courses_id":"373","courseAverage":71.59,"maxFail":11},{"courses_dept":"soci","courses_id":"200","courseAverage":71.59,"maxFail":20},{"courses_dept":"busi","courses_id":"112","courseAverage":71.59,"maxFail":21},{"courses_dept":"poli","courses_id":"303","courseAverage":71.61,"maxFail":7},{"courses_dept":"apbi","courses_id":"210","courseAverage":71.66,"maxFail":1},{"courses_dept":"hist","courses_id":"378","courseAverage":71.66,"maxFail":5},{"courses_dept":"psyc","courses_id":"367","courseAverage":71.66,"maxFail":14},{"courses_dept":"biol","courses_id":"234","courseAverage":71.67,"maxFail":44},{"courses_dept":"fren","courses_id":"112","courseAverage":71.71,"maxFail":18},{"courses_dept":"geog","courses_id":"391","courseAverage":71.72,"maxFail":4},{"courses_dept":"span","courses_id":"202","courseAverage":71.72,"maxFail":10},{"courses_dept":"busi","courses_id":"499","courseAverage":71.73,"maxFail":25},{"courses_dept":"cons","courses_id":"200","courseAverage":71.74,"maxFail":24},{"courses_dept":"biol","courses_id":"364","courseAverage":71.77,"maxFail":21},{"courses_dept":"fren","courses_id":"222","courseAverage":71.79,"maxFail":3},{"courses_dept":"geog","courses_id":"353","courseAverage":71.81,"maxFail":2},{"courses_dept":"phys","courses_id":"203","courseAverage":71.81,"maxFail":8},{"courses_dept":"hist","courses_id":"324","courseAverage":71.82,"maxFail":1},{"courses_dept":"psyc","courses_id":"365","courseAverage":71.84,"maxFail":10},{"courses_dept":"phys","courses_id":"170","courseAverage":71.85,"maxFail":111},{"courses_dept":"clst","courses_id":"231","courseAverage":71.88,"maxFail":9},{"courses_dept":"mine","courses_id":"403","courseAverage":71.89,"maxFail":4},{"courses_dept":"engl","courses_id":"340","courseAverage":71.89,"maxFail":7},{"courses_dept":"fmst","courses_id":"316","courseAverage":71.92,"maxFail":11},{"courses_dept":"japn","courses_id":"301","courseAverage":71.95,"maxFail":1},{"courses_dept":"span","courses_id":"101","courseAverage":71.95,"maxFail":51},{"courses_dept":"frst","courses_id":"202","courseAverage":71.97,"maxFail":1},{"courses_dept":"musc","courses_id":"101","courseAverage":71.97,"maxFail":3},{"courses_dept":"soci","courses_id":"328","courseAverage":71.97,"maxFail":10},{"courses_dept":"clst","courses_id":"319","courseAverage":71.99,"maxFail":4},{"courses_dept":"hist","courses_id":"106","courseAverage":71.99,"maxFail":14},{"courses_dept":"ital","courses_id":"408","courseAverage":72,"maxFail":0},{"courses_dept":"law","courses_id":"359","courseAverage":72,"maxFail":1},{"courses_dept":"fnh","courses_id":"301","courseAverage":72,"maxFail":2},{"courses_dept":"japn","courses_id":"100","courseAverage":72.01,"maxFail":49},{"courses_dept":"fren","courses_id":"342","courseAverage":72.02,"maxFail":1},{"courses_dept":"bioc","courses_id":"410","courseAverage":72.02,"maxFail":5},{"courses_dept":"hist","courses_id":"369","courseAverage":72.02,"maxFail":6},{"courses_dept":"econ","courses_id":"221","courseAverage":72.02,"maxFail":24},{"courses_dept":"geog","courses_id":"361","courseAverage":72.04,"maxFail":2},{"courses_dept":"biol","courses_id":"306","courseAverage":72.04,"maxFail":8},{"courses_dept":"chbe","courses_id":"402","courseAverage":72.05,"maxFail":1},{"courses_dept":"hist","courses_id":"323","courseAverage":72.05,"maxFail":2},{"courses_dept":"math","courses_id":"313","courseAverage":72.06,"maxFail":1},{"courses_dept":"engl","courses_id":"112","courseAverage":72.06,"maxFail":79},{"courses_dept":"psyc","courses_id":"319","courseAverage":72.07,"maxFail":9},{"courses_dept":"psyc","courses_id":"462","courseAverage":72.08,"maxFail":4},{"courses_dept":"cpsc","courses_id":"317","courseAverage":72.09,"maxFail":20},{"courses_dept":"asia","courses_id":"326","courseAverage":72.1,"maxFail":6},{"courses_dept":"chem","courses_id":"313","courseAverage":72.1,"maxFail":8},{"courses_dept":"hist","courses_id":"476","courseAverage":72.12,"maxFail":2},{"courses_dept":"visa","courses_id":"110","courseAverage":72.12,"maxFail":20},{"courses_dept":"bioc","courses_id":"203","courseAverage":72.13,"maxFail":5},{"courses_dept":"econ","courses_id":"371","courseAverage":72.13,"maxFail":11},{"courses_dept":"geob","courses_id":"308","courseAverage":72.14,"maxFail":1},{"courses_dept":"kin","courses_id":"330","courseAverage":72.14,"maxFail":19},{"courses_dept":"econ","courses_id":"345","courseAverage":72.14,"maxFail":33},{"courses_dept":"comm","courses_id":"101","courseAverage":72.15,"maxFail":21},{"courses_dept":"econ","courses_id":"472","courseAverage":72.16,"maxFail":6},{"courses_dept":"japn","courses_id":"103","courseAverage":72.16,"maxFail":6},{"courses_dept":"hist","courses_id":"350","courseAverage":72.17,"maxFail":2},{"courses_dept":"mine","courses_id":"396","courseAverage":72.17,"maxFail":5},{"courses_dept":"econ","courses_id":"370","courseAverage":72.18,"maxFail":6},{"courses_dept":"mech","courses_id":"326","courseAverage":72.18,"maxFail":6},{"courses_dept":"geog","courses_id":"374","courseAverage":72.18,"maxFail":9},{"courses_dept":"hist","courses_id":"376","courseAverage":72.2,"maxFail":2},{"courses_dept":"hist","courses_id":"365","courseAverage":72.2,"maxFail":3},{"courses_dept":"psyc","courses_id":"301","courseAverage":72.2,"maxFail":17},{"courses_dept":"mine","courses_id":"302","courseAverage":72.21,"maxFail":1},{"courses_dept":"psyc","courses_id":"404","courseAverage":72.21,"maxFail":3},{"courses_dept":"phys","courses_id":"403","courseAverage":72.21,"maxFail":10},{"courses_dept":"mtrl","courses_id":"485","courseAverage":72.22,"maxFail":2},{"courses_dept":"eosc","courses_id":"320","courseAverage":72.23,"maxFail":2},{"courses_dept":"hist","courses_id":"464","courseAverage":72.24,"maxFail":2},{"courses_dept":"mtrl","courses_id":"475","courseAverage":72.24,"maxFail":2},{"courses_dept":"engl","courses_id":"110","courseAverage":72.26,"maxFail":32},{"courses_dept":"psyc","courses_id":"260","courseAverage":72.27,"maxFail":1},{"courses_dept":"hist","courses_id":"259","courseAverage":72.27,"maxFail":3},{"courses_dept":"hist","courses_id":"318","courseAverage":72.27,"maxFail":3},{"courses_dept":"geob","courses_id":"307","courseAverage":72.29,"maxFail":0},{"courses_dept":"frst","courses_id":"444","courseAverage":72.29,"maxFail":1},{"courses_dept":"hist","courses_id":"327","courseAverage":72.29,"maxFail":2},{"courses_dept":"phil","courses_id":"334","courseAverage":72.31,"maxFail":4},{"courses_dept":"astr","courses_id":"205","courseAverage":72.33,"maxFail":2},{"courses_dept":"chbe","courses_id":"346","courseAverage":72.33,"maxFail":8},{"courses_dept":"micb","courses_id":"302","courseAverage":72.33,"maxFail":30},{"courses_dept":"clst","courses_id":"111","courseAverage":72.34,"maxFail":1},{"courses_dept":"eosc","courses_id":"478","courseAverage":72.34,"maxFail":3},{"courses_dept":"asia","courses_id":"451","courseAverage":72.35,"maxFail":0},{"courses_dept":"last","courses_id":"201","courseAverage":72.35,"maxFail":2},{"courses_dept":"latn","courses_id":"102","courseAverage":72.36,"maxFail":3},{"courses_dept":"math","courses_id":"308","courseAverage":72.36,"maxFail":4},{"courses_dept":"hist","courses_id":"432","courseAverage":72.36,"maxFail":6},{"courses_dept":"stat","courses_id":"251","courseAverage":72.36,"maxFail":22},{"courses_dept":"phil","courses_id":"371","courseAverage":72.4,"maxFail":2},{"courses_dept":"clst","courses_id":"212","courseAverage":72.4,"maxFail":4},{"courses_dept":"math","courses_id":"322","courseAverage":72.4,"maxFail":6},{"courses_dept":"stat","courses_id":"302","courseAverage":72.4,"maxFail":11},{"courses_dept":"hist","courses_id":"393","courseAverage":72.41,"maxFail":1},{"courses_dept":"ital","courses_id":"102","courseAverage":72.42,"maxFail":9},{"courses_dept":"comm","courses_id":"294","courseAverage":72.43,"maxFail":20},{"courses_dept":"econ","courses_id":"302","courseAverage":72.43,"maxFail":39},{"courses_dept":"chem","courses_id":"333","courseAverage":72.44,"maxFail":11},{"courses_dept":"geog","courses_id":"364","courseAverage":72.45,"maxFail":3},{"courses_dept":"eosc","courses_id":"321","courseAverage":72.46,"maxFail":2},{"courses_dept":"japn","courses_id":"101","courseAverage":72.46,"maxFail":14},{"courses_dept":"chin","courses_id":"463","courseAverage":72.47,"maxFail":0},{"courses_dept":"psyc","courses_id":"460","courseAverage":72.47,"maxFail":3},{"courses_dept":"geog","courses_id":"281","courseAverage":72.48,"maxFail":2},{"courses_dept":"clst","courses_id":"105","courseAverage":72.48,"maxFail":37},{"courses_dept":"phys","courses_id":"312","courseAverage":72.5,"maxFail":2},{"courses_dept":"mech","courses_id":"329","courseAverage":72.51,"maxFail":3},{"courses_dept":"micb","courses_id":"308","courseAverage":72.51,"maxFail":10},{"courses_dept":"engl","courses_id":"111","courseAverage":72.52,"maxFail":11},{"courses_dept":"soci","courses_id":"364","courseAverage":72.53,"maxFail":3},{"courses_dept":"mtrl","courses_id":"494","courseAverage":72.54,"maxFail":8},{"courses_dept":"engl","courses_id":"227","courseAverage":72.55,"maxFail":8},{"courses_dept":"japn","courses_id":"210","courseAverage":72.56,"maxFail":4},{"courses_dept":"econ","courses_id":"365","courseAverage":72.58,"maxFail":6},{"courses_dept":"mtrl","courses_id":"358","courseAverage":72.58,"maxFail":6},{"courses_dept":"comm","courses_id":"355","courseAverage":72.58,"maxFail":15},{"courses_dept":"chbe","courses_id":"345","courseAverage":72.61,"maxFail":5},{"courses_dept":"chin","courses_id":"104","courseAverage":72.62,"maxFail":4},{"courses_dept":"geog","courses_id":"220","courseAverage":72.62,"maxFail":5},{"courses_dept":"chem","courses_id":"211","courseAverage":72.63,"maxFail":35},{"courses_dept":"comm","courses_id":"291","courseAverage":72.63,"maxFail":37},{"courses_dept":"asia","courses_id":"200","courseAverage":72.64,"maxFail":1},{"courses_dept":"geog","courses_id":"362","courseAverage":72.64,"maxFail":2},{"courses_dept":"stat","courses_id":"300","courseAverage":72.64,"maxFail":2},{"courses_dept":"apbi","courses_id":"328","courseAverage":72.64,"maxFail":3},{"courses_dept":"wood","courses_id":"290","courseAverage":72.66,"maxFail":2},{"courses_dept":"mtrl","courses_id":"201","courseAverage":72.67,"maxFail":0},{"courses_dept":"econ","courses_id":"318","courseAverage":72.68,"maxFail":2},{"courses_dept":"frst","courses_id":"307","courseAverage":72.69,"maxFail":4},{"courses_dept":"relg","courses_id":"306","courseAverage":72.71,"maxFail":5},{"courses_dept":"comm","courses_id":"292","courseAverage":72.71,"maxFail":45},{"courses_dept":"geog","courses_id":"357","courseAverage":72.72,"maxFail":2},{"courses_dept":"phar","courses_id":"498","courseAverage":72.73,"maxFail":2},{"courses_dept":"asia","courses_id":"363","courseAverage":72.74,"maxFail":2},{"courses_dept":"igen","courses_id":"201","courseAverage":72.75,"maxFail":3},{"courses_dept":"econ","courses_id":"301","courseAverage":72.76,"maxFail":17},{"courses_dept":"apbi","courses_id":"460","courseAverage":72.77,"maxFail":1},{"courses_dept":"geob","courses_id":"372","courseAverage":72.77,"maxFail":5},{"courses_dept":"japn","courses_id":"102","courseAverage":72.77,"maxFail":11},{"courses_dept":"engl","courses_id":"222","courseAverage":72.78,"maxFail":17},{"courses_dept":"mech","courses_id":"221","courseAverage":72.8,"maxFail":7},{"courses_dept":"astr","courses_id":"310","courseAverage":72.8,"maxFail":12},{"courses_dept":"chem","courses_id":"302","courseAverage":72.8,"maxFail":16},{"courses_dept":"ital","courses_id":"202","courseAverage":72.82,"maxFail":3},{"courses_dept":"phys","courses_id":"401","courseAverage":72.82,"maxFail":12},{"courses_dept":"busi","courses_id":"354","courseAverage":72.82,"maxFail":19},{"courses_dept":"geog","courses_id":"310","courseAverage":72.84,"maxFail":12},{"courses_dept":"mech","courses_id":"485","courseAverage":72.86,"maxFail":4},{"courses_dept":"fist","courses_id":"332","courseAverage":72.86,"maxFail":7},{"courses_dept":"psyc","courses_id":"368","courseAverage":72.86,"maxFail":7},{"courses_dept":"chem","courses_id":"410","courseAverage":72.87,"maxFail":2},{"courses_dept":"educ","courses_id":"140","courseAverage":72.87,"maxFail":2},{"courses_dept":"arcl","courses_id":"419","courseAverage":72.89,"maxFail":0},{"courses_dept":"geob","courses_id":"206","courseAverage":72.89,"maxFail":2},{"courses_dept":"poli","courses_id":"100","courseAverage":72.9,"maxFail":36},{"courses_dept":"laso","courses_id":"204","courseAverage":72.91,"maxFail":3},{"courses_dept":"econ","courses_id":"355","courseAverage":72.93,"maxFail":27},{"courses_dept":"econ","courses_id":"451","courseAverage":72.94,"maxFail":5},{"courses_dept":"comm","courses_id":"290","courseAverage":72.95,"maxFail":100},{"courses_dept":"hist","courses_id":"302","courseAverage":72.96,"maxFail":3},{"courses_dept":"wood","courses_id":"276","courseAverage":72.97,"maxFail":0},{"courses_dept":"econ","courses_id":"234","courseAverage":72.97,"maxFail":12},{"courses_dept":"fren","courses_id":"102","courseAverage":72.97,"maxFail":21},{"courses_dept":"poli","courses_id":"260","courseAverage":72.98,"maxFail":26},{"courses_dept":"stat","courses_id":"406","courseAverage":73,"maxFail":0},{"courses_dept":"educ","courses_id":"240","courseAverage":73,"maxFail":4},{"courses_dept":"itst","courses_id":"231","courseAverage":73.01,"maxFail":3},{"courses_dept":"comm","courses_id":"393","courseAverage":73.01,"maxFail":33},{"courses_dept":"mine","courses_id":"303","courseAverage":73.02,"maxFail":1},{"courses_dept":"econ","courses_id":"456","courseAverage":73.02,"maxFail":3},{"courses_dept":"geog","courses_id":"350","courseAverage":73.04,"maxFail":5},{"courses_dept":"fist","courses_id":"100","courseAverage":73.05,"maxFail":22},{"courses_dept":"law","courses_id":"476","courseAverage":73.06,"maxFail":0},{"courses_dept":"civl","courses_id":"410","courseAverage":73.06,"maxFail":6},{"courses_dept":"asia","courses_id":"453","courseAverage":73.07,"maxFail":2},{"courses_dept":"civl","courses_id":"340","courseAverage":73.07,"maxFail":7},{"courses_dept":"geob","courses_id":"401","courseAverage":73.08,"maxFail":1},{"courses_dept":"hist","courses_id":"319","courseAverage":73.08,"maxFail":5},{"courses_dept":"arth","courses_id":"227","courseAverage":73.08,"maxFail":9},{"courses_dept":"busi","courses_id":"453","courseAverage":73.08,"maxFail":19},{"courses_dept":"stat","courses_id":"203","courseAverage":73.09,"maxFail":9},{"courses_dept":"biol","courses_id":"140","courseAverage":73.09,"maxFail":26},{"courses_dept":"econ","courses_id":"255","courseAverage":73.1,"maxFail":11},{"courses_dept":"phil","courses_id":"316","courseAverage":73.11,"maxFail":2},{"courses_dept":"stat","courses_id":"200","courseAverage":73.11,"maxFail":33},{"courses_dept":"eosc","courses_id":"220","courseAverage":73.14,"maxFail":3},{"courses_dept":"biol","courses_id":"336","courseAverage":73.14,"maxFail":9},{"courses_dept":"law","courses_id":"300","courseAverage":73.17,"maxFail":1},{"courses_dept":"frst","courses_id":"415","courseAverage":73.18,"maxFail":3},{"courses_dept":"geog","courses_id":"319","courseAverage":73.21,"maxFail":4},{"courses_dept":"mech","courses_id":"223","courseAverage":73.23,"maxFail":4},{"courses_dept":"span","courses_id":"201","courseAverage":73.23,"maxFail":14},{"courses_dept":"econ","courses_id":"311","courseAverage":73.24,"maxFail":11},{"courses_dept":"chbe","courses_id":"356","courseAverage":73.24,"maxFail":14},{"courses_dept":"poli","courses_id":"309","courseAverage":73.25,"maxFail":3},{"courses_dept":"eosc","courses_id":"110","courseAverage":73.25,"maxFail":21},{"courses_dept":"kin","courses_id":"151","courseAverage":73.26,"maxFail":10},{"courses_dept":"geob","courses_id":"207","courseAverage":73.28,"maxFail":4},{"courses_dept":"cons","courses_id":"495","courseAverage":73.3,"maxFail":1},{"courses_dept":"law","courses_id":"459","courseAverage":73.3,"maxFail":1},{"courses_dept":"econ","courses_id":"211","courseAverage":73.3,"maxFail":2},{"courses_dept":"eosc","courses_id":"210","courseAverage":73.3,"maxFail":5},{"courses_dept":"geog","courses_id":"329","courseAverage":73.31,"maxFail":1},{"courses_dept":"japn","courses_id":"302","courseAverage":73.31,"maxFail":1},{"courses_dept":"fopr","courses_id":"261","courseAverage":73.33,"maxFail":1},{"courses_dept":"busi","courses_id":"451","courseAverage":73.33,"maxFail":3},{"courses_dept":"crwr","courses_id":"201","courseAverage":73.33,"maxFail":7},{"courses_dept":"math","courses_id":"441","courseAverage":73.34,"maxFail":0},{"courses_dept":"geob","courses_id":"373","courseAverage":73.34,"maxFail":1},{"courses_dept":"law","courses_id":"469","courseAverage":73.35,"maxFail":0},{"courses_dept":"clst","courses_id":"333","courseAverage":73.35,"maxFail":1},{"courses_dept":"astr","courses_id":"311","courseAverage":73.35,"maxFail":7},{"courses_dept":"mech","courses_id":"325","courseAverage":73.35,"maxFail":10},{"courses_dept":"fopr","courses_id":"464","courseAverage":73.36,"maxFail":0},{"courses_dept":"geob","courses_id":"305","courseAverage":73.37,"maxFail":0},{"courses_dept":"japn","courses_id":"406","courseAverage":73.37,"maxFail":2},{"courses_dept":"fren","courses_id":"101","courseAverage":73.37,"maxFail":27},{"courses_dept":"wood","courses_id":"464","courseAverage":73.39,"maxFail":1},{"courses_dept":"dhyg","courses_id":"108","courseAverage":73.41,"maxFail":2},{"courses_dept":"phys","courses_id":"102","courseAverage":73.42,"maxFail":61},{"courses_dept":"frst","courses_id":"395","courseAverage":73.43,"maxFail":3},{"courses_dept":"musc","courses_id":"120","courseAverage":73.43,"maxFail":8},{"courses_dept":"geog","courses_id":"497","courseAverage":73.44,"maxFail":1},{"courses_dept":"hist","courses_id":"325","courseAverage":73.45,"maxFail":4},{"courses_dept":"engl","courses_id":"100","courseAverage":73.45,"maxFail":11},{"courses_dept":"bioc","courses_id":"303","courseAverage":73.46,"maxFail":5},{"courses_dept":"psyc","courses_id":"360","courseAverage":73.47,"maxFail":4},{"courses_dept":"cpsc","courses_id":"404","courseAverage":73.47,"maxFail":8},{"courses_dept":"cpsc","courses_id":"322","courseAverage":73.47,"maxFail":15},{"courses_dept":"fnh","courses_id":"330","courseAverage":73.48,"maxFail":8},{"courses_dept":"eosc","courses_id":"310","courseAverage":73.48,"maxFail":38},{"courses_dept":"biol","courses_id":"201","courseAverage":73.48,"maxFail":86},{"courses_dept":"japn","courses_id":"303","courseAverage":73.51,"maxFail":1},{"courses_dept":"latn","courses_id":"201","courseAverage":73.51,"maxFail":1},{"courses_dept":"geog","courses_id":"318","courseAverage":73.51,"maxFail":2},{"courses_dept":"frst","courses_id":"319","courseAverage":73.52,"maxFail":2},{"courses_dept":"chbe","courses_id":"381","courseAverage":73.53,"maxFail":2},{"courses_dept":"frst","courses_id":"385","courseAverage":73.53,"maxFail":3},{"courses_dept":"stat","courses_id":"241","courseAverage":73.53,"maxFail":4},{"courses_dept":"apsc","courses_id":"201","courseAverage":73.54,"maxFail":46},{"courses_dept":"astr","courses_id":"403","courseAverage":73.55,"maxFail":2},{"courses_dept":"cpsc","courses_id":"303","courseAverage":73.55,"maxFail":5},{"courses_dept":"cpsc","courses_id":"340","courseAverage":73.55,"maxFail":7},{"courses_dept":"fmst","courses_id":"238","courseAverage":73.56,"maxFail":2},{"courses_dept":"biol","courses_id":"320","courseAverage":73.56,"maxFail":4},{"courses_dept":"poli","courses_id":"220","courseAverage":73.57,"maxFail":10},{"courses_dept":"fren","courses_id":"111","courseAverage":73.57,"maxFail":21},{"courses_dept":"biol","courses_id":"203","courseAverage":73.58,"maxFail":0},{"courses_dept":"poli","courses_id":"327","courseAverage":73.59,"maxFail":3},{"courses_dept":"clst","courses_id":"311","courseAverage":73.61,"maxFail":1},{"courses_dept":"bioc","courses_id":"304","courseAverage":73.61,"maxFail":2},{"courses_dept":"hist","courses_id":"409","courseAverage":73.63,"maxFail":3},{"courses_dept":"wood","courses_id":"384","courseAverage":73.64,"maxFail":1},{"courses_dept":"poli","courses_id":"240","courseAverage":73.64,"maxFail":13},{"courses_dept":"phys","courses_id":"101","courseAverage":73.64,"maxFail":184},{"courses_dept":"eosc","courses_id":"432","courseAverage":73.65,"maxFail":1},{"courses_dept":"fist","courses_id":"240","courseAverage":73.65,"maxFail":2},{"courses_dept":"clst","courses_id":"317","courseAverage":73.67,"maxFail":1},{"courses_dept":"kin","courses_id":"415","courseAverage":73.67,"maxFail":2},{"courses_dept":"math","courses_id":"323","courseAverage":73.67,"maxFail":2},{"courses_dept":"phar","courses_id":"409","courseAverage":73.69,"maxFail":0},{"courses_dept":"anth","courses_id":"217","courseAverage":73.7,"maxFail":6},{"courses_dept":"anth","courses_id":"213","courseAverage":73.71,"maxFail":2},{"courses_dept":"econ","courses_id":"210","courseAverage":73.71,"maxFail":4},{"courses_dept":"econ","courses_id":"367","courseAverage":73.71,"maxFail":4},{"courses_dept":"hist","courses_id":"367","courseAverage":73.71,"maxFail":4},{"courses_dept":"japn","courses_id":"314","courseAverage":73.72,"maxFail":1},{"courses_dept":"chbe","courses_id":"481","courseAverage":73.73,"maxFail":1},{"courses_dept":"mine","courses_id":"333","courseAverage":73.73,"maxFail":4},{"courses_dept":"math","courses_id":"316","courseAverage":73.73,"maxFail":17},{"courses_dept":"scie","courses_id":"113","courseAverage":73.73,"maxFail":25},{"courses_dept":"econ","courses_id":"482","courseAverage":73.75,"maxFail":1},{"courses_dept":"eosc","courses_id":"314","courseAverage":73.75,"maxFail":22},{"courses_dept":"asia","courses_id":"456","courseAverage":73.76,"maxFail":2},{"courses_dept":"phys","courses_id":"350","courseAverage":73.76,"maxFail":7},{"courses_dept":"law","courses_id":"437","courseAverage":73.77,"maxFail":0},{"courses_dept":"law","courses_id":"422","courseAverage":73.77,"maxFail":2},{"courses_dept":"civl","courses_id":"408","courseAverage":73.78,"maxFail":2},{"courses_dept":"visa","courses_id":"183","courseAverage":73.78,"maxFail":5},{"courses_dept":"law","courses_id":"400","courseAverage":73.8,"maxFail":0},{"courses_dept":"civl","courses_id":"305","courseAverage":73.8,"maxFail":3},{"courses_dept":"fnh","courses_id":"351","courseAverage":73.81,"maxFail":2},{"courses_dept":"chem","courses_id":"301","courseAverage":73.81,"maxFail":10},{"courses_dept":"fnh","courses_id":"325","courseAverage":73.83,"maxFail":0},{"courses_dept":"bioc","courses_id":"402","courseAverage":73.83,"maxFail":11},{"courses_dept":"comm","courses_id":"295","courseAverage":73.83,"maxFail":11},{"courses_dept":"econ","courses_id":"328","courseAverage":73.84,"maxFail":1},{"courses_dept":"fist","courses_id":"220","courseAverage":73.84,"maxFail":4},{"courses_dept":"arth","courses_id":"341","courseAverage":73.84,"maxFail":5},{"courses_dept":"chem","courses_id":"325","courseAverage":73.84,"maxFail":6},{"courses_dept":"kin","courses_id":"351","courseAverage":73.85,"maxFail":3},{"courses_dept":"clch","courses_id":"399","courseAverage":73.86,"maxFail":0},{"courses_dept":"geob","courses_id":"370","courseAverage":73.86,"maxFail":2},{"courses_dept":"law","courses_id":"440","courseAverage":73.86,"maxFail":3},{"courses_dept":"hist","courses_id":"317","courseAverage":73.87,"maxFail":2},{"courses_dept":"arth","courses_id":"340","courseAverage":73.87,"maxFail":4},{"courses_dept":"biol","courses_id":"433","courseAverage":73.88,"maxFail":3},{"courses_dept":"bioc","courses_id":"403","courseAverage":73.88,"maxFail":8},{"courses_dept":"chem","courses_id":"315","courseAverage":73.88,"maxFail":10},{"courses_dept":"fren","courses_id":"122","courseAverage":73.88,"maxFail":18},{"courses_dept":"law","courses_id":"325","courseAverage":73.89,"maxFail":1},{"courses_dept":"arth","courses_id":"343","courseAverage":73.9,"maxFail":1},{"courses_dept":"ling","courses_id":"200","courseAverage":73.9,"maxFail":6},{"courses_dept":"fmst","courses_id":"440","courseAverage":73.91,"maxFail":2},{"courses_dept":"engl","courses_id":"358","courseAverage":73.91,"maxFail":3},{"courses_dept":"soci","courses_id":"476","courseAverage":73.92,"maxFail":2},{"courses_dept":"econ","courses_id":"326","courseAverage":73.92,"maxFail":11},{"courses_dept":"geob","courses_id":"406","courseAverage":73.93,"maxFail":2},{"courses_dept":"busi","courses_id":"455","courseAverage":73.93,"maxFail":10},{"courses_dept":"biol","courses_id":"205","courseAverage":73.93,"maxFail":14},{"courses_dept":"chem","courses_id":"235","courseAverage":73.95,"maxFail":5},{"courses_dept":"geog","courses_id":"423","courseAverage":73.96,"maxFail":2},{"courses_dept":"eosc","courses_id":"322","courseAverage":73.97,"maxFail":1},{"courses_dept":"engl","courses_id":"223","courseAverage":73.97,"maxFail":5},{"courses_dept":"eosc","courses_id":"326","courseAverage":73.97,"maxFail":18},{"courses_dept":"law","courses_id":"261","courseAverage":73.98,"maxFail":1},{"courses_dept":"biol","courses_id":"325","courseAverage":73.98,"maxFail":14},{"courses_dept":"apbi","courses_id":"200","courseAverage":73.98,"maxFail":33},{"courses_dept":"law","courses_id":"407","courseAverage":73.99,"maxFail":0},{"courses_dept":"econ","courses_id":"466","courseAverage":73.99,"maxFail":3},{"courses_dept":"civl","courses_id":"332","courseAverage":73.99,"maxFail":12},{"courses_dept":"ling","courses_id":"311","courseAverage":74,"maxFail":4},{"courses_dept":"chem","courses_id":"406","courseAverage":74.01,"maxFail":2},{"courses_dept":"geog","courses_id":"316","courseAverage":74.01,"maxFail":3},{"courses_dept":"arcl","courses_id":"228","courseAverage":74.02,"maxFail":0},{"courses_dept":"phys","courses_id":"100","courseAverage":74.02,"maxFail":85},{"courses_dept":"fopr","courses_id":"262","courseAverage":74.03,"maxFail":3},{"courses_dept":"hist","courses_id":"358","courseAverage":74.04,"maxFail":2},{"courses_dept":"visa","courses_id":"310","courseAverage":74.04,"maxFail":2},{"courses_dept":"soci","courses_id":"382","courseAverage":74.04,"maxFail":7},{"courses_dept":"eosc","courses_id":"372","courseAverage":74.05,"maxFail":5},{"courses_dept":"econ","courses_id":"460","courseAverage":74.06,"maxFail":1},{"courses_dept":"hist","courses_id":"311","courseAverage":74.06,"maxFail":1},{"courses_dept":"itst","courses_id":"234","courseAverage":74.07,"maxFail":2},{"courses_dept":"law","courses_id":"438","courseAverage":74.08,"maxFail":0},{"courses_dept":"fren","courses_id":"123","courseAverage":74.08,"maxFail":6},{"courses_dept":"cpsc","courses_id":"210","courseAverage":74.08,"maxFail":48},{"courses_dept":"eosc","courses_id":"114","courseAverage":74.08,"maxFail":85},{"courses_dept":"fist","courses_id":"200","courseAverage":74.11,"maxFail":5},{"courses_dept":"biol","courses_id":"204","courseAverage":74.12,"maxFail":11},{"courses_dept":"hist","courses_id":"405","courseAverage":74.13,"maxFail":2},{"courses_dept":"itst","courses_id":"345","courseAverage":74.13,"maxFail":2},{"courses_dept":"civl","courses_id":"430","courseAverage":74.13,"maxFail":4},{"courses_dept":"nest","courses_id":"101","courseAverage":74.14,"maxFail":7},{"courses_dept":"biol","courses_id":"300","courseAverage":74.14,"maxFail":22},{"courses_dept":"cpsc","courses_id":"422","courseAverage":74.15,"maxFail":3},{"courses_dept":"cpsc","courses_id":"313","courseAverage":74.15,"maxFail":16},{"courses_dept":"law","courses_id":"201","courseAverage":74.16,"maxFail":1},{"courses_dept":"cpsc","courses_id":"425","courseAverage":74.16,"maxFail":4},{"courses_dept":"comm","courses_id":"354","courseAverage":74.17,"maxFail":5},{"courses_dept":"busi","courses_id":"446","courseAverage":74.18,"maxFail":6},{"courses_dept":"fren","courses_id":"329","courseAverage":74.2,"maxFail":4},{"courses_dept":"phys","courses_id":"305","courseAverage":74.2,"maxFail":5},{"courses_dept":"hist","courses_id":"103","courseAverage":74.2,"maxFail":26},{"courses_dept":"frst","courses_id":"239","courseAverage":74.21,"maxFail":1},{"courses_dept":"geog","courses_id":"429","courseAverage":74.21,"maxFail":1},{"courses_dept":"law","courses_id":"443","courseAverage":74.23,"maxFail":1},{"courses_dept":"asia","courses_id":"318","courseAverage":74.24,"maxFail":1},{"courses_dept":"law","courses_id":"463","courseAverage":74.24,"maxFail":1},{"courses_dept":"math","courses_id":"442","courseAverage":74.24,"maxFail":3},{"courses_dept":"econ","courses_id":"339","courseAverage":74.25,"maxFail":3},{"courses_dept":"kin","courses_id":"230","courseAverage":74.25,"maxFail":7},{"courses_dept":"asia","courses_id":"338","courseAverage":74.26,"maxFail":2},{"courses_dept":"poli","courses_id":"345","courseAverage":74.27,"maxFail":4},{"courses_dept":"chem","courses_id":"341","courseAverage":74.27,"maxFail":5},{"courses_dept":"comm","courses_id":"298","courseAverage":74.27,"maxFail":60},{"courses_dept":"asia","courses_id":"332","courseAverage":74.28,"maxFail":1},{"courses_dept":"ital","courses_id":"201","courseAverage":74.29,"maxFail":2},{"courses_dept":"hist","courses_id":"339","courseAverage":74.3,"maxFail":3},{"courses_dept":"apbi","courses_id":"444","courseAverage":74.31,"maxFail":1},{"courses_dept":"hist","courses_id":"313","courseAverage":74.31,"maxFail":1},{"courses_dept":"musc","courses_id":"300","courseAverage":74.31,"maxFail":4},{"courses_dept":"civl","courses_id":"200","courseAverage":74.31,"maxFail":13},{"courses_dept":"soci","courses_id":"324","courseAverage":74.32,"maxFail":1},{"courses_dept":"wood","courses_id":"487","courseAverage":74.33,"maxFail":0},{"courses_dept":"engl","courses_id":"221","courseAverage":74.33,"maxFail":12},{"courses_dept":"poli","courses_id":"351","courseAverage":74.34,"maxFail":5},{"courses_dept":"wood","courses_id":"356","courseAverage":74.35,"maxFail":0},{"courses_dept":"cnrs","courses_id":"370","courseAverage":74.35,"maxFail":4},{"courses_dept":"mtrl","courses_id":"458","courseAverage":74.36,"maxFail":3},{"courses_dept":"cpsc","courses_id":"213","courseAverage":74.37,"maxFail":20},{"courses_dept":"eosc","courses_id":"222","courseAverage":74.38,"maxFail":2},{"courses_dept":"anth","courses_id":"315","courseAverage":74.38,"maxFail":3},{"courses_dept":"eosc","courses_id":"430","courseAverage":74.4,"maxFail":1},{"courses_dept":"comm","courses_id":"434","courseAverage":74.4,"maxFail":2},{"courses_dept":"engl","courses_id":"220","courseAverage":74.41,"maxFail":9},{"courses_dept":"law","courses_id":"377","courseAverage":74.43,"maxFail":0},{"courses_dept":"comm","courses_id":"473","courseAverage":74.43,"maxFail":22},{"courses_dept":"law","courses_id":"397","courseAverage":74.44,"maxFail":1},{"courses_dept":"fnh","courses_id":"309","courseAverage":74.45,"maxFail":4},{"courses_dept":"kin","courses_id":"389","courseAverage":74.45,"maxFail":7},{"courses_dept":"mine","courses_id":"310","courseAverage":74.46,"maxFail":4},{"courses_dept":"mtrl","courses_id":"456","courseAverage":74.47,"maxFail":1},{"courses_dept":"hist","courses_id":"260","courseAverage":74.47,"maxFail":4},{"courses_dept":"law","courses_id":"455","courseAverage":74.5,"maxFail":0},{"courses_dept":"ital","courses_id":"404","courseAverage":74.5,"maxFail":1},{"courses_dept":"mech","courses_id":"543","courseAverage":74.5,"maxFail":1},{"courses_dept":"japn","courses_id":"211","courseAverage":74.51,"maxFail":2},{"courses_dept":"kin","courses_id":"371","courseAverage":74.51,"maxFail":7},{"courses_dept":"biol","courses_id":"362","courseAverage":74.52,"maxFail":2},{"courses_dept":"law","courses_id":"241","courseAverage":74.52,"maxFail":2},{"courses_dept":"frst","courses_id":"211","courseAverage":74.54,"maxFail":5},{"courses_dept":"law","courses_id":"436","courseAverage":74.55,"maxFail":0},{"courses_dept":"law","courses_id":"251","courseAverage":74.55,"maxFail":1},{"courses_dept":"pcth","courses_id":"305","courseAverage":74.55,"maxFail":4},{"courses_dept":"law","courses_id":"221","courseAverage":74.56,"maxFail":1},{"courses_dept":"geob","courses_id":"472","courseAverage":74.56,"maxFail":2},{"courses_dept":"comm","courses_id":"450","courseAverage":74.57,"maxFail":10},{"courses_dept":"japn","courses_id":"213","courseAverage":74.58,"maxFail":2},{"courses_dept":"chem","courses_id":"205","courseAverage":74.58,"maxFail":59},{"courses_dept":"eosc","courses_id":"112","courseAverage":74.61,"maxFail":26},{"courses_dept":"cpsc","courses_id":"110","courseAverage":74.61,"maxFail":157},{"courses_dept":"eosc","courses_id":"331","courseAverage":74.62,"maxFail":1},{"courses_dept":"hist","courses_id":"379","courseAverage":74.62,"maxFail":3},{"courses_dept":"chin","courses_id":"311","courseAverage":74.63,"maxFail":1},{"courses_dept":"nest","courses_id":"301","courseAverage":74.63,"maxFail":3},{"courses_dept":"chin","courses_id":"431","courseAverage":74.63,"maxFail":4},{"courses_dept":"law","courses_id":"464","courseAverage":74.64,"maxFail":0},{"courses_dept":"law","courses_id":"316","courseAverage":74.64,"maxFail":1},{"courses_dept":"fnh","courses_id":"250","courseAverage":74.64,"maxFail":18},{"courses_dept":"musc","courses_id":"119","courseAverage":74.67,"maxFail":5},{"courses_dept":"econ","courses_id":"356","courseAverage":74.67,"maxFail":21},{"courses_dept":"geog","courses_id":"311","courseAverage":74.68,"maxFail":0},{"courses_dept":"phar","courses_id":"351","courseAverage":74.69,"maxFail":1},{"courses_dept":"comm","courses_id":"329","courseAverage":74.69,"maxFail":7},{"courses_dept":"comm","courses_id":"493","courseAverage":74.7,"maxFail":1},{"courses_dept":"hist","courses_id":"441","courseAverage":74.71,"maxFail":3},{"courses_dept":"fre","courses_id":"302","courseAverage":74.72,"maxFail":1},{"courses_dept":"phys","courses_id":"341","courseAverage":74.72,"maxFail":2},{"courses_dept":"phys","courses_id":"314","courseAverage":74.74,"maxFail":1},{"courses_dept":"apbi","courses_id":"495","courseAverage":74.74,"maxFail":2},{"courses_dept":"visa","courses_id":"210","courseAverage":74.74,"maxFail":2},{"courses_dept":"clst","courses_id":"353","courseAverage":74.75,"maxFail":0},{"courses_dept":"itst","courses_id":"385","courseAverage":74.75,"maxFail":2},{"courses_dept":"kin","courses_id":"231","courseAverage":74.75,"maxFail":7},{"courses_dept":"ling","courses_id":"101","courseAverage":74.77,"maxFail":16},{"courses_dept":"phys","courses_id":"301","courseAverage":74.78,"maxFail":19},{"courses_dept":"biol","courses_id":"346","courseAverage":74.79,"maxFail":1},{"courses_dept":"asia","courses_id":"315","courseAverage":74.79,"maxFail":2},{"courses_dept":"asia","courses_id":"347","courseAverage":74.79,"maxFail":2},{"courses_dept":"law","courses_id":"372","courseAverage":74.79,"maxFail":2},{"courses_dept":"cpsc","courses_id":"416","courseAverage":74.8,"maxFail":3},{"courses_dept":"geog","courses_id":"426","courseAverage":74.81,"maxFail":1},{"courses_dept":"hist","courses_id":"273","courseAverage":74.81,"maxFail":2},{"courses_dept":"anth","courses_id":"220","courseAverage":74.81,"maxFail":3},{"courses_dept":"hist","courses_id":"392","courseAverage":74.83,"maxFail":0},{"courses_dept":"law","courses_id":"452","courseAverage":74.83,"maxFail":0},{"courses_dept":"law","courses_id":"387","courseAverage":74.83,"maxFail":2},{"courses_dept":"audi","courses_id":"402","courseAverage":74.83,"maxFail":6},{"courses_dept":"itst","courses_id":"413","courseAverage":74.84,"maxFail":1},{"courses_dept":"grsj","courses_id":"325","courseAverage":74.84,"maxFail":2},{"courses_dept":"kin","courses_id":"275","courseAverage":74.84,"maxFail":5},{"courses_dept":"engl","courses_id":"321","courseAverage":74.84,"maxFail":33},{"courses_dept":"ling","courses_id":"100","courseAverage":74.84,"maxFail":33},{"courses_dept":"law","courses_id":"211","courseAverage":74.86,"maxFail":2},{"courses_dept":"math","courses_id":"401","courseAverage":74.86,"maxFail":3},{"courses_dept":"eosc","courses_id":"340","courseAverage":74.86,"maxFail":12},{"courses_dept":"chin","courses_id":"433","courseAverage":74.87,"maxFail":3},{"courses_dept":"engl","courses_id":"343","courseAverage":74.87,"maxFail":3},{"courses_dept":"asia","courses_id":"314","courseAverage":74.88,"maxFail":3},{"courses_dept":"chin","courses_id":"107","courseAverage":74.89,"maxFail":0},{"courses_dept":"fnh","courses_id":"303","courseAverage":74.89,"maxFail":0},{"courses_dept":"fre","courses_id":"460","courseAverage":74.89,"maxFail":0},{"courses_dept":"mine","courses_id":"331","courseAverage":74.92,"maxFail":2},{"courses_dept":"law","courses_id":"408","courseAverage":74.94,"maxFail":0},{"courses_dept":"eosc","courses_id":"353","courseAverage":74.94,"maxFail":1},{"courses_dept":"math","courses_id":"223","courseAverage":74.94,"maxFail":4},{"courses_dept":"micb","courses_id":"202","courseAverage":74.94,"maxFail":47},{"courses_dept":"astr","courses_id":"200","courseAverage":74.95,"maxFail":2},{"courses_dept":"econ","courses_id":"336","courseAverage":74.95,"maxFail":4},{"courses_dept":"soci","courses_id":"342","courseAverage":74.95,"maxFail":5},{"courses_dept":"econ","courses_id":"465","courseAverage":74.96,"maxFail":2},{"courses_dept":"law","courses_id":"281","courseAverage":74.98,"maxFail":0},{"courses_dept":"cpsc","courses_id":"259","courseAverage":74.98,"maxFail":17},{"courses_dept":"law","courses_id":"352","courseAverage":75,"maxFail":0},{"courses_dept":"geog","courses_id":"371","courseAverage":75,"maxFail":2},{"courses_dept":"chem","courses_id":"403","courseAverage":75.02,"maxFail":0},{"courses_dept":"kin","courses_id":"475","courseAverage":75.02,"maxFail":2},{"courses_dept":"anth","courses_id":"227","courseAverage":75.02,"maxFail":3},{"courses_dept":"econ","courses_id":"406","courseAverage":75.03,"maxFail":2},{"courses_dept":"biol","courses_id":"418","courseAverage":75.04,"maxFail":1},{"courses_dept":"apbi","courses_id":"403","courseAverage":75.04,"maxFail":2},{"courses_dept":"arth","courses_id":"300","courseAverage":75.04,"maxFail":5},{"courses_dept":"chin","courses_id":"201","courseAverage":75.05,"maxFail":1},{"courses_dept":"eosc","courses_id":"475","courseAverage":75.05,"maxFail":2},{"courses_dept":"econ","courses_id":"334","courseAverage":75.06,"maxFail":2},{"courses_dept":"arth","courses_id":"251","courseAverage":75.06,"maxFail":3},{"courses_dept":"fmst","courses_id":"314","courseAverage":75.06,"maxFail":6},{"courses_dept":"busi","courses_id":"401","courseAverage":75.06,"maxFail":12},{"courses_dept":"biol","courses_id":"412","courseAverage":75.07,"maxFail":4},{"courses_dept":"eosc","courses_id":"223","courseAverage":75.08,"maxFail":0},{"courses_dept":"arth","courses_id":"339","courseAverage":75.08,"maxFail":2},{"courses_dept":"cpsc","courses_id":"221","courseAverage":75.08,"maxFail":35},{"courses_dept":"poli","courses_id":"366","courseAverage":75.1,"maxFail":4},{"courses_dept":"fren","courses_id":"457","courseAverage":75.12,"maxFail":1},{"courses_dept":"comm","courses_id":"353","courseAverage":75.12,"maxFail":6},{"courses_dept":"econ","courses_id":"325","courseAverage":75.12,"maxFail":15},{"courses_dept":"eosc","courses_id":"118","courseAverage":75.13,"maxFail":73},{"courses_dept":"eosc","courses_id":"211","courseAverage":75.15,"maxFail":11},{"courses_dept":"apbi","courses_id":"327","courseAverage":75.16,"maxFail":0},{"courses_dept":"asia","courses_id":"372","courseAverage":75.17,"maxFail":4},{"courses_dept":"eosc","courses_id":"323","courseAverage":75.18,"maxFail":2},{"courses_dept":"comm","courses_id":"498","courseAverage":75.19,"maxFail":1},{"courses_dept":"astr","courses_id":"405","courseAverage":75.19,"maxFail":2},{"courses_dept":"poli","courses_id":"380","courseAverage":75.19,"maxFail":6},{"courses_dept":"econ","courses_id":"421","courseAverage":75.2,"maxFail":2},{"courses_dept":"geog","courses_id":"290","courseAverage":75.2,"maxFail":3},{"courses_dept":"kin","courses_id":"191","courseAverage":75.2,"maxFail":16},{"courses_dept":"kin","courses_id":"369","courseAverage":75.21,"maxFail":1},{"courses_dept":"law","courses_id":"231","courseAverage":75.22,"maxFail":0},{"courses_dept":"wood","courses_id":"485","courseAverage":75.23,"maxFail":0},{"courses_dept":"arth","courses_id":"225","courseAverage":75.23,"maxFail":2},{"courses_dept":"engl","courses_id":"362","courseAverage":75.23,"maxFail":10},{"courses_dept":"geog","courses_id":"457","courseAverage":75.24,"maxFail":0},{"courses_dept":"econ","courses_id":"447","courseAverage":75.25,"maxFail":2},{"courses_dept":"econ","courses_id":"480","courseAverage":75.26,"maxFail":1},{"courses_dept":"korn","courses_id":"301","courseAverage":75.27,"maxFail":0},{"courses_dept":"chin","courses_id":"313","courseAverage":75.27,"maxFail":1},{"courses_dept":"fnh","courses_id":"326","courseAverage":75.27,"maxFail":1},{"courses_dept":"phys","courses_id":"200","courseAverage":75.27,"maxFail":8},{"courses_dept":"fren","courses_id":"370","courseAverage":75.28,"maxFail":2},{"courses_dept":"thtr","courses_id":"420","courseAverage":75.28,"maxFail":2},{"courses_dept":"mech","courses_id":"405","courseAverage":75.29,"maxFail":1},{"courses_dept":"comm","courses_id":"394","courseAverage":75.29,"maxFail":2},{"courses_dept":"kin","courses_id":"462","courseAverage":75.3,"maxFail":0},{"courses_dept":"japn","courses_id":"212","courseAverage":75.31,"maxFail":1},{"courses_dept":"civl","courses_id":"320","courseAverage":75.31,"maxFail":2},{"courses_dept":"busi","courses_id":"470","courseAverage":75.32,"maxFail":1},{"courses_dept":"frst","courses_id":"339","courseAverage":75.33,"maxFail":0},{"courses_dept":"fren","courses_id":"357","courseAverage":75.33,"maxFail":1},{"courses_dept":"russ","courses_id":"200","courseAverage":75.34,"maxFail":2},{"courses_dept":"frst","courses_id":"399","courseAverage":75.35,"maxFail":0},{"courses_dept":"phys","courses_id":"309","courseAverage":75.35,"maxFail":0},{"courses_dept":"chem","courses_id":"413","courseAverage":75.35,"maxFail":1},{"courses_dept":"clst","courses_id":"260","courseAverage":75.35,"maxFail":8},{"courses_dept":"hist","courses_id":"315","courseAverage":75.36,"maxFail":0},{"courses_dept":"geob","courses_id":"409","courseAverage":75.37,"maxFail":0},{"courses_dept":"hist","courses_id":"364","courseAverage":75.39,"maxFail":0},{"courses_dept":"comm","courses_id":"446","courseAverage":75.39,"maxFail":1},{"courses_dept":"chem","courses_id":"305","courseAverage":75.39,"maxFail":3},{"courses_dept":"law","courses_id":"468","courseAverage":75.4,"maxFail":0},{"courses_dept":"arcl","courses_id":"204","courseAverage":75.4,"maxFail":1},{"courses_dept":"wood","courses_id":"493","courseAverage":75.4,"maxFail":1},{"courses_dept":"arbc","courses_id":"202","courseAverage":75.4,"maxFail":2},{"courses_dept":"fist","courses_id":"210","courseAverage":75.4,"maxFail":3},{"courses_dept":"wood","courses_id":"465","courseAverage":75.41,"maxFail":0},{"courses_dept":"anth","courses_id":"241","courseAverage":75.41,"maxFail":1},{"courses_dept":"apsc","courses_id":"160","courseAverage":75.43,"maxFail":141},{"courses_dept":"asia","courses_id":"386","courseAverage":75.44,"maxFail":1},{"courses_dept":"poli","courses_id":"110","courseAverage":75.45,"maxFail":13},{"courses_dept":"anth","courses_id":"407","courseAverage":75.47,"maxFail":3},{"courses_dept":"chin","courses_id":"103","courseAverage":75.47,"maxFail":3},{"courses_dept":"mtrl","courses_id":"442","courseAverage":75.48,"maxFail":0},{"courses_dept":"apbi","courses_id":"324","courseAverage":75.5,"maxFail":0},{"courses_dept":"dent","courses_id":"528","courseAverage":75.5,"maxFail":0},{"courses_dept":"law","courses_id":"453","courseAverage":75.51,"maxFail":0},{"courses_dept":"law","courses_id":"416","courseAverage":75.52,"maxFail":0},{"courses_dept":"hist","courses_id":"363","courseAverage":75.52,"maxFail":1},{"courses_dept":"geog","courses_id":"485","courseAverage":75.53,"maxFail":0},{"courses_dept":"apbi","courses_id":"426","courseAverage":75.53,"maxFail":1},{"courses_dept":"ling","courses_id":"327","courseAverage":75.53,"maxFail":2},{"courses_dept":"engl","courses_id":"225","courseAverage":75.53,"maxFail":4},{"courses_dept":"anth","courses_id":"312","courseAverage":75.54,"maxFail":1},{"courses_dept":"mtrl","courses_id":"350","courseAverage":75.55,"maxFail":1},{"courses_dept":"law","courses_id":"394","courseAverage":75.56,"maxFail":0},{"courses_dept":"phar","courses_id":"451","courseAverage":75.56,"maxFail":0},{"courses_dept":"comm","courses_id":"405","courseAverage":75.56,"maxFail":1},{"courses_dept":"ling","courses_id":"314","courseAverage":75.56,"maxFail":2},{"courses_dept":"frst","courses_id":"386","courseAverage":75.56,"maxFail":3},{"courses_dept":"law","courses_id":"462","courseAverage":75.57,"maxFail":0},{"courses_dept":"anth","courses_id":"332","courseAverage":75.57,"maxFail":1},{"courses_dept":"phar","courses_id":"323","courseAverage":75.58,"maxFail":1},{"courses_dept":"arth","courses_id":"338","courseAverage":75.58,"maxFail":2},{"courses_dept":"phys","courses_id":"306","courseAverage":75.58,"maxFail":3},{"courses_dept":"kin","courses_id":"103","courseAverage":75.58,"maxFail":4},{"courses_dept":"astr","courses_id":"101","courseAverage":75.58,"maxFail":8},{"courses_dept":"lled","courses_id":"213","courseAverage":75.59,"maxFail":0},{"courses_dept":"asia","courses_id":"411","courseAverage":75.59,"maxFail":1},{"courses_dept":"wood","courses_id":"494","courseAverage":75.59,"maxFail":1},{"courses_dept":"fnh","courses_id":"335","courseAverage":75.6,"maxFail":0},{"courses_dept":"comm","courses_id":"491","courseAverage":75.6,"maxFail":2},{"courses_dept":"fnh","courses_id":"350","courseAverage":75.61,"maxFail":3},{"courses_dept":"fren","courses_id":"221","courseAverage":75.61,"maxFail":3},{"courses_dept":"micb","courses_id":"424","courseAverage":75.62,"maxFail":1},{"courses_dept":"cogs","courses_id":"401","courseAverage":75.62,"maxFail":2},{"courses_dept":"fre","courses_id":"385","courseAverage":75.62,"maxFail":2},{"courses_dept":"chem","courses_id":"345","courseAverage":75.63,"maxFail":3},{"courses_dept":"latn","courses_id":"202","courseAverage":75.64,"maxFail":1},{"courses_dept":"apbi","courses_id":"361","courseAverage":75.64,"maxFail":4},{"courses_dept":"micb","courses_id":"418","courseAverage":75.64,"maxFail":5},{"courses_dept":"mtrl","courses_id":"478","courseAverage":75.65,"maxFail":1},{"courses_dept":"ling","courses_id":"222","courseAverage":75.65,"maxFail":6},{"courses_dept":"surg","courses_id":"510","courseAverage":75.66,"maxFail":1},{"courses_dept":"comm","courses_id":"455","courseAverage":75.66,"maxFail":3},{"courses_dept":"comm","courses_id":"452","courseAverage":75.67,"maxFail":1},{"courses_dept":"mdvl","courses_id":"301","courseAverage":75.67,"maxFail":1},{"courses_dept":"musc","courses_id":"103","courseAverage":75.67,"maxFail":18},{"courses_dept":"clst","courses_id":"312","courseAverage":75.69,"maxFail":1},{"courses_dept":"asia","courses_id":"355","courseAverage":75.69,"maxFail":4},{"courses_dept":"crwr","courses_id":"205","courseAverage":75.69,"maxFail":7},{"courses_dept":"civl","courses_id":"315","courseAverage":75.7,"maxFail":4},{"courses_dept":"comm","courses_id":"395","courseAverage":75.7,"maxFail":4},{"courses_dept":"econ","courses_id":"471","courseAverage":75.71,"maxFail":4},{"courses_dept":"engl","courses_id":"224","courseAverage":75.72,"maxFail":5},{"courses_dept":"law","courses_id":"382","courseAverage":75.73,"maxFail":1},{"courses_dept":"engl","courses_id":"331","courseAverage":75.73,"maxFail":3},{"courses_dept":"mech","courses_id":"491","courseAverage":75.74,"maxFail":2},{"courses_dept":"chin","courses_id":"105","courseAverage":75.75,"maxFail":1},{"courses_dept":"chin","courses_id":"111","courseAverage":75.76,"maxFail":5},{"courses_dept":"asia","courses_id":"357","courseAverage":75.77,"maxFail":3},{"courses_dept":"urst","courses_id":"200","courseAverage":75.78,"maxFail":0},{"courses_dept":"lled","courses_id":"223","courseAverage":75.78,"maxFail":2},{"courses_dept":"musc","courses_id":"241","courseAverage":75.78,"maxFail":2},{"courses_dept":"cons","courses_id":"340","courseAverage":75.79,"maxFail":1},{"courses_dept":"cons","courses_id":"330","courseAverage":75.8,"maxFail":1},{"courses_dept":"visa","courses_id":"380","courseAverage":75.8,"maxFail":1},{"courses_dept":"poli","courses_id":"332","courseAverage":75.8,"maxFail":2},{"courses_dept":"phys","courses_id":"333","courseAverage":75.8,"maxFail":3},{"courses_dept":"soci","courses_id":"220","courseAverage":75.81,"maxFail":3},{"courses_dept":"busi","courses_id":"442","courseAverage":75.82,"maxFail":7},{"courses_dept":"comm","courses_id":"382","courseAverage":75.83,"maxFail":1},{"courses_dept":"clst","courses_id":"334","courseAverage":75.83,"maxFail":3},{"courses_dept":"ital","courses_id":"409","courseAverage":75.84,"maxFail":0},{"courses_dept":"asia","courses_id":"250","courseAverage":75.84,"maxFail":2},{"courses_dept":"wood","courses_id":"292","courseAverage":75.84,"maxFail":2},{"courses_dept":"clst","courses_id":"301","courseAverage":75.85,"maxFail":53},{"courses_dept":"law","courses_id":"386","courseAverage":75.86,"maxFail":0},{"courses_dept":"enph","courses_id":"352","courseAverage":75.86,"maxFail":2},{"courses_dept":"biol","courses_id":"153","courseAverage":75.88,"maxFail":20},{"courses_dept":"chbe","courses_id":"474","courseAverage":75.89,"maxFail":1},{"courses_dept":"cons","courses_id":"425","courseAverage":75.89,"maxFail":2},{"courses_dept":"obst","courses_id":"502","courseAverage":75.9,"maxFail":1},{"courses_dept":"arcl","courses_id":"318","courseAverage":75.92,"maxFail":0},{"courses_dept":"chin","courses_id":"117","courseAverage":75.92,"maxFail":2},{"courses_dept":"geog","courses_id":"312","courseAverage":75.92,"maxFail":4},{"courses_dept":"korn","courses_id":"102","courseAverage":75.92,"maxFail":6},{"courses_dept":"biol","courses_id":"455","courseAverage":75.93,"maxFail":1},{"courses_dept":"civl","courses_id":"417","courseAverage":75.93,"maxFail":1},{"courses_dept":"apbi","courses_id":"419","courseAverage":75.93,"maxFail":3},{"courses_dept":"span","courses_id":"358","courseAverage":75.94,"maxFail":0},{"courses_dept":"eosc","courses_id":"433","courseAverage":75.94,"maxFail":1},{"courses_dept":"apsc","courses_id":"262","courseAverage":75.94,"maxFail":2},{"courses_dept":"hist","courses_id":"418","courseAverage":75.94,"maxFail":2},{"courses_dept":"eosc","courses_id":"470","courseAverage":75.95,"maxFail":2},{"courses_dept":"fre","courses_id":"306","courseAverage":75.95,"maxFail":2},{"courses_dept":"frst","courses_id":"318","courseAverage":75.96,"maxFail":1},{"courses_dept":"arth","courses_id":"346","courseAverage":75.97,"maxFail":3},{"courses_dept":"chin","courses_id":"323","courseAverage":75.98,"maxFail":1},{"courses_dept":"japn","courses_id":"410","courseAverage":75.98,"maxFail":1},{"courses_dept":"chbe","courses_id":"577","courseAverage":75.98,"maxFail":2},{"courses_dept":"civl","courses_id":"231","courseAverage":75.98,"maxFail":12},{"courses_dept":"bala","courses_id":"503","courseAverage":75.99,"maxFail":0},{"courses_dept":"chin","courses_id":"203","courseAverage":75.99,"maxFail":0},{"courses_dept":"mech","courses_id":"358","courseAverage":75.99,"maxFail":3},{"courses_dept":"mech","courses_id":"439","courseAverage":76,"maxFail":0},{"courses_dept":"span","courses_id":"548","courseAverage":76,"maxFail":0},{"courses_dept":"lfs","courses_id":"150","courseAverage":76,"maxFail":1},{"courses_dept":"grsj","courses_id":"101","courseAverage":76,"maxFail":5},{"courses_dept":"math","courses_id":"217","courseAverage":76,"maxFail":6},{"courses_dept":"mine","courses_id":"402","courseAverage":76.01,"maxFail":1},{"courses_dept":"lled","courses_id":"222","courseAverage":76.02,"maxFail":2},{"courses_dept":"musc","courses_id":"104","courseAverage":76.02,"maxFail":2},{"courses_dept":"lled","courses_id":"221","courseAverage":76.03,"maxFail":0},{"courses_dept":"chin","courses_id":"108","courseAverage":76.04,"maxFail":1},{"courses_dept":"comm","courses_id":"280","courseAverage":76.04,"maxFail":1},{"courses_dept":"eosc","courses_id":"352","courseAverage":76.04,"maxFail":1},{"courses_dept":"ling","courses_id":"300","courseAverage":76.04,"maxFail":2},{"courses_dept":"thtr","courses_id":"120","courseAverage":76.04,"maxFail":12},{"courses_dept":"hist","courses_id":"425","courseAverage":76.05,"maxFail":1},{"courses_dept":"fren","courses_id":"220","courseAverage":76.05,"maxFail":3},{"courses_dept":"japn","courses_id":"315","courseAverage":76.06,"maxFail":0},{"courses_dept":"econ","courses_id":"442","courseAverage":76.06,"maxFail":2},{"courses_dept":"law","courses_id":"395","courseAverage":76.07,"maxFail":1},{"courses_dept":"hist","courses_id":"326","courseAverage":76.08,"maxFail":1},{"courses_dept":"fre","courses_id":"374","courseAverage":76.08,"maxFail":2},{"courses_dept":"comm","courses_id":"363","courseAverage":76.09,"maxFail":2},{"courses_dept":"mech","courses_id":"464","courseAverage":76.09,"maxFail":2},{"courses_dept":"ling","courses_id":"209","courseAverage":76.09,"maxFail":5},{"courses_dept":"chin","courses_id":"101","courseAverage":76.09,"maxFail":7},{"courses_dept":"mech","courses_id":"462","courseAverage":76.1,"maxFail":2},{"courses_dept":"mine","courses_id":"292","courseAverage":76.1,"maxFail":6},{"courses_dept":"ling","courses_id":"345","courseAverage":76.11,"maxFail":0},{"courses_dept":"mine","courses_id":"224","courseAverage":76.11,"maxFail":2},{"courses_dept":"soci","courses_id":"380","courseAverage":76.11,"maxFail":2},{"courses_dept":"law","courses_id":"489","courseAverage":76.13,"maxFail":0},{"courses_dept":"busi","courses_id":"329","courseAverage":76.13,"maxFail":1},{"courses_dept":"chbe","courses_id":"262","courseAverage":76.14,"maxFail":2},{"courses_dept":"arcl","courses_id":"326","courseAverage":76.15,"maxFail":0},{"courses_dept":"fren","courses_id":"224","courseAverage":76.15,"maxFail":1},{"courses_dept":"biol","courses_id":"331","courseAverage":76.16,"maxFail":2},{"courses_dept":"law","courses_id":"461","courseAverage":76.18,"maxFail":0},{"courses_dept":"busi","courses_id":"291","courseAverage":76.19,"maxFail":1},{"courses_dept":"chin","courses_id":"113","courseAverage":76.19,"maxFail":1},{"courses_dept":"ital","courses_id":"303","courseAverage":76.19,"maxFail":1},{"courses_dept":"atsc","courses_id":"404","courseAverage":76.2,"maxFail":0},{"courses_dept":"cpsc","courses_id":"302","courseAverage":76.2,"maxFail":2},{"courses_dept":"comm","courses_id":"296","courseAverage":76.2,"maxFail":4},{"courses_dept":"geog","courses_id":"410","courseAverage":76.22,"maxFail":0},{"courses_dept":"frst","courses_id":"304","courseAverage":76.22,"maxFail":1},{"courses_dept":"mech","courses_id":"466","courseAverage":76.22,"maxFail":2},{"courses_dept":"grsj","courses_id":"300","courseAverage":76.22,"maxFail":8},{"courses_dept":"comm","courses_id":"370","courseAverage":76.22,"maxFail":16},{"courses_dept":"poli","courses_id":"373","courseAverage":76.23,"maxFail":4},{"courses_dept":"relg","courses_id":"316","courseAverage":76.24,"maxFail":1},{"courses_dept":"cpsc","courses_id":"121","courseAverage":76.24,"maxFail":42},{"courses_dept":"anth","courses_id":"378","courseAverage":76.25,"maxFail":4},{"courses_dept":"span","courses_id":"221","courseAverage":76.27,"maxFail":2},{"courses_dept":"asia","courses_id":"356","courseAverage":76.27,"maxFail":3},{"courses_dept":"comm","courses_id":"307","courseAverage":76.27,"maxFail":4},{"courses_dept":"lled","courses_id":"212","courseAverage":76.28,"maxFail":0},{"courses_dept":"ling","courses_id":"319","courseAverage":76.3,"maxFail":0},{"courses_dept":"geog","courses_id":"446","courseAverage":76.31,"maxFail":1},{"courses_dept":"chin","courses_id":"208","courseAverage":76.32,"maxFail":0},{"courses_dept":"caps","courses_id":"390","courseAverage":76.32,"maxFail":10},{"courses_dept":"wood","courses_id":"474","courseAverage":76.33,"maxFail":0},{"courses_dept":"last","courses_id":"100","courseAverage":76.33,"maxFail":2},{"courses_dept":"thtr","courses_id":"320","courseAverage":76.33,"maxFail":3},{"courses_dept":"chbe","courses_id":"230","courseAverage":76.33,"maxFail":9},{"courses_dept":"biol","courses_id":"324","courseAverage":76.34,"maxFail":1},{"courses_dept":"chin","courses_id":"321","courseAverage":76.34,"maxFail":2},{"courses_dept":"relg","courses_id":"203","courseAverage":76.35,"maxFail":3},{"courses_dept":"fnh","courses_id":"313","courseAverage":76.37,"maxFail":1},{"courses_dept":"engl","courses_id":"311","courseAverage":76.37,"maxFail":2},{"courses_dept":"lled","courses_id":"220","courseAverage":76.38,"maxFail":2},{"courses_dept":"law","courses_id":"448","courseAverage":76.39,"maxFail":1},{"courses_dept":"law","courses_id":"334","courseAverage":76.39,"maxFail":2},{"courses_dept":"asia","courses_id":"382","courseAverage":76.4,"maxFail":5},{"courses_dept":"phys","courses_id":"402","courseAverage":76.42,"maxFail":2},{"courses_dept":"visa","courses_id":"240","courseAverage":76.42,"maxFail":2},{"courses_dept":"biol","courses_id":"260","courseAverage":76.42,"maxFail":16},{"courses_dept":"phil","courses_id":"150","courseAverage":76.43,"maxFail":1},{"courses_dept":"visa","courses_id":"311","courseAverage":76.43,"maxFail":1},{"courses_dept":"visa","courses_id":"230","courseAverage":76.43,"maxFail":2},{"courses_dept":"dhyg","courses_id":"405","courseAverage":76.43,"maxFail":3},{"courses_dept":"fnh","courses_id":"300","courseAverage":76.44,"maxFail":2},{"courses_dept":"asia","courses_id":"308","courseAverage":76.44,"maxFail":5},{"courses_dept":"frst","courses_id":"201","courseAverage":76.44,"maxFail":7},{"courses_dept":"span","courses_id":"365","courseAverage":76.45,"maxFail":2},{"courses_dept":"relg","courses_id":"321","courseAverage":76.46,"maxFail":1},{"courses_dept":"visa","courses_id":"341","courseAverage":76.46,"maxFail":1},{"courses_dept":"mtrl","courses_id":"363","courseAverage":76.46,"maxFail":4},{"courses_dept":"grsj","courses_id":"301","courseAverage":76.47,"maxFail":1},{"courses_dept":"math","courses_id":"226","courseAverage":76.47,"maxFail":3},{"courses_dept":"hist","courses_id":"280","courseAverage":76.48,"maxFail":0},{"courses_dept":"comm","courses_id":"365","courseAverage":76.48,"maxFail":5},{"courses_dept":"law","courses_id":"460","courseAverage":76.49,"maxFail":0},{"courses_dept":"asia","courses_id":"369","courseAverage":76.49,"maxFail":3},{"courses_dept":"micb","courses_id":"203","courseAverage":76.5,"maxFail":1},{"courses_dept":"arth","courses_id":"361","courseAverage":76.51,"maxFail":0},{"courses_dept":"soci","courses_id":"444","courseAverage":76.51,"maxFail":1},{"courses_dept":"wood","courses_id":"482","courseAverage":76.52,"maxFail":0},{"courses_dept":"eosc","courses_id":"350","courseAverage":76.52,"maxFail":1},{"courses_dept":"visa","courses_id":"381","courseAverage":76.52,"maxFail":1},{"courses_dept":"visa","courses_id":"241","courseAverage":76.53,"maxFail":2},{"courses_dept":"eosc","courses_id":"311","courseAverage":76.53,"maxFail":3},{"courses_dept":"hist","courses_id":"408","courseAverage":76.54,"maxFail":0},{"courses_dept":"chin","courses_id":"115","courseAverage":76.54,"maxFail":1},{"courses_dept":"frst","courses_id":"303","courseAverage":76.54,"maxFail":8},{"courses_dept":"law","courses_id":"451","courseAverage":76.55,"maxFail":0},{"courses_dept":"micb","courses_id":"306","courseAverage":76.55,"maxFail":6},{"courses_dept":"law","courses_id":"404","courseAverage":76.56,"maxFail":0},{"courses_dept":"law","courses_id":"525","courseAverage":76.56,"maxFail":1},{"courses_dept":"mtrl","courses_id":"486","courseAverage":76.56,"maxFail":2},{"courses_dept":"geog","courses_id":"250","courseAverage":76.56,"maxFail":3},{"courses_dept":"relg","courses_id":"201","courseAverage":76.6,"maxFail":1},{"courses_dept":"eosc","courses_id":"422","courseAverage":76.61,"maxFail":1},{"courses_dept":"hist","courses_id":"382","courseAverage":76.61,"maxFail":3},{"courses_dept":"chin","courses_id":"214","courseAverage":76.62,"maxFail":1},{"courses_dept":"frst","courses_id":"100","courseAverage":76.62,"maxFail":6},{"courses_dept":"wood","courses_id":"461","courseAverage":76.63,"maxFail":1},{"courses_dept":"biol","courses_id":"464","courseAverage":76.64,"maxFail":0},{"courses_dept":"dhyg","courses_id":"110","courseAverage":76.64,"maxFail":1},{"courses_dept":"apbi","courses_id":"418","courseAverage":76.64,"maxFail":2},{"courses_dept":"phys","courses_id":"405","courseAverage":76.65,"maxFail":1},{"courses_dept":"lled","courses_id":"211","courseAverage":76.66,"maxFail":0},{"courses_dept":"civl","courses_id":"228","courseAverage":76.66,"maxFail":4},{"courses_dept":"wood","courses_id":"386","courseAverage":76.68,"maxFail":0},{"courses_dept":"econ","courses_id":"304","courseAverage":76.69,"maxFail":1},{"courses_dept":"biol","courses_id":"321","courseAverage":76.7,"maxFail":2},{"courses_dept":"comm","courses_id":"202","courseAverage":76.7,"maxFail":31},{"courses_dept":"arth","courses_id":"347","courseAverage":76.71,"maxFail":4},{"courses_dept":"cpsc","courses_id":"314","courseAverage":76.71,"maxFail":8},{"courses_dept":"stat","courses_id":"404","courseAverage":76.73,"maxFail":2},{"courses_dept":"econ","courses_id":"308","courseAverage":76.74,"maxFail":0},{"courses_dept":"cogs","courses_id":"303","courseAverage":76.74,"maxFail":1},{"courses_dept":"wood","courses_id":"330","courseAverage":76.74,"maxFail":1},{"courses_dept":"wood","courses_id":"491","courseAverage":76.75,"maxFail":2},{"courses_dept":"visa","courses_id":"220","courseAverage":76.75,"maxFail":4},{"courses_dept":"psyc","courses_id":"409","courseAverage":76.76,"maxFail":2},{"courses_dept":"law","courses_id":"505","courseAverage":76.77,"maxFail":1},{"courses_dept":"asia","courses_id":"410","courseAverage":76.78,"maxFail":0},{"courses_dept":"hist","courses_id":"391","courseAverage":76.8,"maxFail":0},{"courses_dept":"lled","courses_id":"210","courseAverage":76.8,"maxFail":0},{"courses_dept":"ling","courses_id":"433","courseAverage":76.8,"maxFail":1},{"courses_dept":"asia","courses_id":"387","courseAverage":76.82,"maxFail":1},{"courses_dept":"kin","courses_id":"473","courseAverage":76.82,"maxFail":2},{"courses_dept":"mtrl","courses_id":"495","courseAverage":76.83,"maxFail":1},{"courses_dept":"cpsc","courses_id":"421","courseAverage":76.83,"maxFail":2},{"courses_dept":"fren","courses_id":"334","courseAverage":76.84,"maxFail":2},{"courses_dept":"crwr","courses_id":"230","courseAverage":76.84,"maxFail":4},{"courses_dept":"chin","courses_id":"207","courseAverage":76.86,"maxFail":0},{"courses_dept":"cpsc","courses_id":"304","courseAverage":76.86,"maxFail":4},{"courses_dept":"chin","courses_id":"211","courseAverage":76.88,"maxFail":1},{"courses_dept":"comm","courses_id":"390","courseAverage":76.88,"maxFail":9},{"courses_dept":"arth","courses_id":"464","courseAverage":76.89,"maxFail":0},{"courses_dept":"geog","courses_id":"419","courseAverage":76.89,"maxFail":1},{"courses_dept":"asic","courses_id":"200","courseAverage":76.89,"maxFail":2},{"courses_dept":"phys","courses_id":"473","courseAverage":76.89,"maxFail":2},{"courses_dept":"mine","courses_id":"488","courseAverage":76.91,"maxFail":0},{"courses_dept":"fnh","courses_id":"398","courseAverage":76.91,"maxFail":2},{"courses_dept":"relg","courses_id":"209","courseAverage":76.92,"maxFail":1},{"courses_dept":"clst","courses_id":"356","courseAverage":76.92,"maxFail":6},{"courses_dept":"econ","courses_id":"310","courseAverage":76.92,"maxFail":6},{"courses_dept":"civl","courses_id":"437","courseAverage":76.94,"maxFail":0},{"courses_dept":"comm","courses_id":"465","courseAverage":76.95,"maxFail":2},{"courses_dept":"germ","courses_id":"402","courseAverage":76.96,"maxFail":0},{"courses_dept":"scan","courses_id":"335","courseAverage":76.97,"maxFail":5},{"courses_dept":"comm","courses_id":"449","courseAverage":76.98,"maxFail":1},{"courses_dept":"mech","courses_id":"431","courseAverage":76.98,"maxFail":9},{"courses_dept":"eece","courses_id":"512","courseAverage":77,"maxFail":0},{"courses_dept":"kin","courses_id":"261","courseAverage":77,"maxFail":3},{"courses_dept":"astr","courses_id":"102","courseAverage":77,"maxFail":11},{"courses_dept":"rgla","courses_id":"371","courseAverage":77.01,"maxFail":2},{"courses_dept":"musc","courses_id":"310","courseAverage":77.02,"maxFail":1},{"courses_dept":"biol","courses_id":"345","courseAverage":77.03,"maxFail":1},{"courses_dept":"frst","courses_id":"320","courseAverage":77.03,"maxFail":1},{"courses_dept":"comm","courses_id":"336","courseAverage":77.04,"maxFail":1},{"courses_dept":"eosc","courses_id":"315","courseAverage":77.04,"maxFail":11},{"courses_dept":"comm","courses_id":"461","courseAverage":77.07,"maxFail":1},{"courses_dept":"anth","courses_id":"301","courseAverage":77.09,"maxFail":1},{"courses_dept":"comm","courses_id":"453","courseAverage":77.09,"maxFail":7},{"courses_dept":"biol","courses_id":"323","courseAverage":77.11,"maxFail":0},{"courses_dept":"mtrl","courses_id":"471","courseAverage":77.11,"maxFail":0},{"courses_dept":"comm","courses_id":"469","courseAverage":77.11,"maxFail":2},{"courses_dept":"econ","courses_id":"390","courseAverage":77.12,"maxFail":0},{"courses_dept":"phil","courses_id":"388","courseAverage":77.12,"maxFail":0},{"courses_dept":"law","courses_id":"439","courseAverage":77.14,"maxFail":1},{"courses_dept":"comm","courses_id":"306","courseAverage":77.14,"maxFail":2},{"courses_dept":"hist","courses_id":"455","courseAverage":77.15,"maxFail":1},{"courses_dept":"cpsc","courses_id":"311","courseAverage":77.17,"maxFail":9},{"courses_dept":"chin","courses_id":"204","courseAverage":77.18,"maxFail":0},{"courses_dept":"path","courses_id":"303","courseAverage":77.18,"maxFail":0},{"courses_dept":"comm","courses_id":"438","courseAverage":77.18,"maxFail":1},{"courses_dept":"fre","courses_id":"516","courseAverage":77.21,"maxFail":1},{"courses_dept":"chin","courses_id":"301","courseAverage":77.22,"maxFail":0},{"courses_dept":"geob","courses_id":"309","courseAverage":77.22,"maxFail":0},{"courses_dept":"micb","courses_id":"405","courseAverage":77.22,"maxFail":1},{"courses_dept":"thtr","courses_id":"211","courseAverage":77.22,"maxFail":3},{"courses_dept":"fnh","courses_id":"402","courseAverage":77.23,"maxFail":1},{"courses_dept":"anth","courses_id":"428","courseAverage":77.24,"maxFail":1},{"courses_dept":"psyc","courses_id":"366","courseAverage":77.24,"maxFail":1},{"courses_dept":"civl","courses_id":"411","courseAverage":77.25,"maxFail":2},{"courses_dept":"law","courses_id":"509","courseAverage":77.26,"maxFail":0},{"courses_dept":"apbi","courses_id":"401","courseAverage":77.26,"maxFail":1},{"courses_dept":"arth","courses_id":"448","courseAverage":77.26,"maxFail":1},{"courses_dept":"law","courses_id":"356","courseAverage":77.26,"maxFail":1},{"courses_dept":"phys","courses_id":"408","courseAverage":77.27,"maxFail":4},{"courses_dept":"arch","courses_id":"505","courseAverage":77.28,"maxFail":1},{"courses_dept":"mtrl","courses_id":"455","courseAverage":77.28,"maxFail":2},{"courses_dept":"arth","courses_id":"226","courseAverage":77.28,"maxFail":4},{"courses_dept":"civl","courses_id":"230","courseAverage":77.28,"maxFail":7},{"courses_dept":"asia","courses_id":"300","courseAverage":77.29,"maxFail":1},{"courses_dept":"chin","courses_id":"217","courseAverage":77.3,"maxFail":0},{"courses_dept":"fren","courses_id":"330","courseAverage":77.3,"maxFail":1},{"courses_dept":"comm","courses_id":"374","courseAverage":77.3,"maxFail":4},{"courses_dept":"mech","courses_id":"306","courseAverage":77.32,"maxFail":1},{"courses_dept":"visa","courses_id":"250","courseAverage":77.32,"maxFail":1},{"courses_dept":"comm","courses_id":"371","courseAverage":77.32,"maxFail":8},{"courses_dept":"micb","courses_id":"323","courseAverage":77.33,"maxFail":0},{"courses_dept":"cohr","courses_id":"408","courseAverage":77.34,"maxFail":1},{"courses_dept":"musc","courses_id":"358","courseAverage":77.35,"maxFail":0},{"courses_dept":"chin","courses_id":"471","courseAverage":77.35,"maxFail":2},{"courses_dept":"comm","courses_id":"441","courseAverage":77.36,"maxFail":1},{"courses_dept":"micb","courses_id":"301","courseAverage":77.36,"maxFail":2},{"courses_dept":"civl","courses_id":"537","courseAverage":77.36,"maxFail":5},{"courses_dept":"grsj","courses_id":"305","courseAverage":77.38,"maxFail":0},{"courses_dept":"crwr","courses_id":"213","courseAverage":77.39,"maxFail":7},{"courses_dept":"cens","courses_id":"201","courseAverage":77.4,"maxFail":3},{"courses_dept":"eosc","courses_id":"428","courseAverage":77.41,"maxFail":0},{"courses_dept":"span","courses_id":"206","courseAverage":77.41,"maxFail":2},{"courses_dept":"clst","courses_id":"355","courseAverage":77.42,"maxFail":0},{"courses_dept":"phar","courses_id":"401","courseAverage":77.42,"maxFail":0},{"courses_dept":"mine","courses_id":"304","courseAverage":77.42,"maxFail":1},{"courses_dept":"math","courses_id":"121","courseAverage":77.42,"maxFail":2},{"courses_dept":"law","courses_id":"410","courseAverage":77.44,"maxFail":0},{"courses_dept":"visa","courses_id":"260","courseAverage":77.44,"maxFail":1},{"courses_dept":"span","courses_id":"302","courseAverage":77.45,"maxFail":1},{"courses_dept":"fnh","courses_id":"200","courseAverage":77.45,"maxFail":20},{"courses_dept":"grsj","courses_id":"326","courseAverage":77.46,"maxFail":0},{"courses_dept":"frst","courses_id":"305","courseAverage":77.46,"maxFail":1},{"courses_dept":"math","courses_id":"422","courseAverage":77.46,"maxFail":1},{"courses_dept":"biol","courses_id":"457","courseAverage":77.47,"maxFail":1},{"courses_dept":"biol","courses_id":"463","courseAverage":77.47,"maxFail":3},{"courses_dept":"geob","courses_id":"402","courseAverage":77.48,"maxFail":1},{"courses_dept":"comm","courses_id":"495","courseAverage":77.5,"maxFail":0},{"courses_dept":"visa","courses_id":"330","courseAverage":77.5,"maxFail":0},{"courses_dept":"surg","courses_id":"512","courseAverage":77.51,"maxFail":1},{"courses_dept":"sowk","courses_id":"201","courseAverage":77.51,"maxFail":2},{"courses_dept":"micb","courses_id":"353","courseAverage":77.52,"maxFail":1},{"courses_dept":"chin","courses_id":"473","courseAverage":77.52,"maxFail":2},{"courses_dept":"asia","courses_id":"385","courseAverage":77.53,"maxFail":1},{"courses_dept":"biol","courses_id":"363","courseAverage":77.53,"maxFail":1},{"courses_dept":"span","courses_id":"301","courseAverage":77.53,"maxFail":2},{"courses_dept":"fren","courses_id":"215","courseAverage":77.54,"maxFail":1},{"courses_dept":"biol","courses_id":"361","courseAverage":77.54,"maxFail":5},{"courses_dept":"phar","courses_id":"452","courseAverage":77.55,"maxFail":0},{"courses_dept":"mech","courses_id":"473","courseAverage":77.55,"maxFail":2},{"courses_dept":"biol","courses_id":"327","courseAverage":77.56,"maxFail":0},{"courses_dept":"japn","courses_id":"416","courseAverage":77.56,"maxFail":0},{"courses_dept":"mtrl","courses_id":"467","courseAverage":77.56,"maxFail":2},{"courses_dept":"arch","courses_id":"405","courseAverage":77.57,"maxFail":0},{"courses_dept":"asia","courses_id":"365","courseAverage":77.57,"maxFail":2},{"courses_dept":"micb","courses_id":"322","courseAverage":77.59,"maxFail":0},{"courses_dept":"math","courses_id":"406","courseAverage":77.6,"maxFail":1},{"courses_dept":"visa","courses_id":"351","courseAverage":77.6,"maxFail":1},{"courses_dept":"musc","courses_id":"410","courseAverage":77.61,"maxFail":0},{"courses_dept":"cpsc","courses_id":"410","courseAverage":77.61,"maxFail":5},{"courses_dept":"phil","courses_id":"378","courseAverage":77.63,"maxFail":4},{"courses_dept":"musc","courses_id":"309","courseAverage":77.64,"maxFail":3},{"courses_dept":"phys","courses_id":"438","courseAverage":77.66,"maxFail":0},{"courses_dept":"econ","courses_id":"317","courseAverage":77.66,"maxFail":1},{"courses_dept":"audi","courses_id":"403","courseAverage":77.67,"maxFail":2},{"courses_dept":"geob","courses_id":"407","courseAverage":77.67,"maxFail":2},{"courses_dept":"geog","courses_id":"395","courseAverage":77.67,"maxFail":3},{"courses_dept":"dhyg","courses_id":"401","courseAverage":77.68,"maxFail":2},{"courses_dept":"chin","courses_id":"215","courseAverage":77.69,"maxFail":0},{"courses_dept":"chin","courses_id":"484","courseAverage":77.69,"maxFail":0},{"courses_dept":"kin","courses_id":"362","courseAverage":77.69,"maxFail":0},{"courses_dept":"port","courses_id":"102","courseAverage":77.69,"maxFail":0},{"courses_dept":"astr","courses_id":"406","courseAverage":77.7,"maxFail":0},{"courses_dept":"relg","courses_id":"309","courseAverage":77.7,"maxFail":0},{"courses_dept":"comm","courses_id":"407","courseAverage":77.7,"maxFail":1},{"courses_dept":"eosc","courses_id":"425","courseAverage":77.71,"maxFail":1},{"courses_dept":"mech","courses_id":"468","courseAverage":77.71,"maxFail":1},{"courses_dept":"apsc","courses_id":"450","courseAverage":77.72,"maxFail":5},{"courses_dept":"law","courses_id":"449","courseAverage":77.73,"maxFail":0},{"courses_dept":"japn","courses_id":"408","courseAverage":77.73,"maxFail":1},{"courses_dept":"comm","courses_id":"460","courseAverage":77.74,"maxFail":0},{"courses_dept":"fist","courses_id":"436","courseAverage":77.74,"maxFail":0},{"courses_dept":"apbi","courses_id":"260","courseAverage":77.74,"maxFail":1},{"courses_dept":"visa","courses_id":"320","courseAverage":77.74,"maxFail":1},{"courses_dept":"cpsc","courses_id":"418","courseAverage":77.74,"maxFail":2},{"courses_dept":"chin","courses_id":"213","courseAverage":77.75,"maxFail":1},{"courses_dept":"babs","courses_id":"540","courseAverage":77.75,"maxFail":2},{"courses_dept":"mech","courses_id":"380","courseAverage":77.75,"maxFail":5},{"courses_dept":"crwr","courses_id":"203","courseAverage":77.75,"maxFail":6},{"courses_dept":"eosc","courses_id":"240","courseAverage":77.76,"maxFail":1},{"courses_dept":"cpsc","courses_id":"430","courseAverage":77.77,"maxFail":1},{"courses_dept":"path","courses_id":"437","courseAverage":77.79,"maxFail":0},{"courses_dept":"apsc","courses_id":"440","courseAverage":77.79,"maxFail":1},{"courses_dept":"biol","courses_id":"328","courseAverage":77.79,"maxFail":1},{"courses_dept":"atsc","courses_id":"409","courseAverage":77.8,"maxFail":0},{"courses_dept":"mine","courses_id":"482","courseAverage":77.8,"maxFail":1},{"courses_dept":"fipr","courses_id":"234","courseAverage":77.8,"maxFail":3},{"courses_dept":"rmes","courses_id":"515","courseAverage":77.81,"maxFail":0},{"courses_dept":"phil","courses_id":"464","courseAverage":77.81,"maxFail":1},{"courses_dept":"hist","courses_id":"483","courseAverage":77.81,"maxFail":2},{"courses_dept":"econ","courses_id":"335","courseAverage":77.82,"maxFail":1},{"courses_dept":"grek","courses_id":"352","courseAverage":77.83,"maxFail":0},{"courses_dept":"apbi","courses_id":"342","courseAverage":77.83,"maxFail":1},{"courses_dept":"mtrl","courses_id":"392","courseAverage":77.83,"maxFail":1},{"courses_dept":"law","courses_id":"465","courseAverage":77.84,"maxFail":0},{"courses_dept":"name","courses_id":"502","courseAverage":77.84,"maxFail":0},{"courses_dept":"stat","courses_id":"450","courseAverage":77.84,"maxFail":0},{"courses_dept":"chin","courses_id":"481","courseAverage":77.84,"maxFail":1},{"courses_dept":"chin","courses_id":"483","courseAverage":77.85,"maxFail":1},{"courses_dept":"visa","courses_id":"480","courseAverage":77.85,"maxFail":1},{"courses_dept":"law","courses_id":"303","courseAverage":77.86,"maxFail":1},{"courses_dept":"phar","courses_id":"399","courseAverage":77.87,"maxFail":5},{"courses_dept":"comm","courses_id":"454","courseAverage":77.88,"maxFail":0},{"courses_dept":"mech","courses_id":"435","courseAverage":77.88,"maxFail":1},{"courses_dept":"comm","courses_id":"468","courseAverage":77.89,"maxFail":1},{"courses_dept":"dhyg","courses_id":"435","courseAverage":77.89,"maxFail":1},{"courses_dept":"comm","courses_id":"475","courseAverage":77.89,"maxFail":3},{"courses_dept":"chin","courses_id":"303","courseAverage":77.9,"maxFail":0},{"courses_dept":"busi","courses_id":"400","courseAverage":77.9,"maxFail":13},{"courses_dept":"mech","courses_id":"535","courseAverage":77.91,"maxFail":0},{"courses_dept":"chem","courses_id":"418","courseAverage":77.91,"maxFail":1},{"courses_dept":"frst","courses_id":"308","courseAverage":77.91,"maxFail":1},{"courses_dept":"mech","courses_id":"305","courseAverage":77.93,"maxFail":6},{"courses_dept":"visa","courses_id":"321","courseAverage":77.94,"maxFail":2},{"courses_dept":"germ","courses_id":"301","courseAverage":77.94,"maxFail":3},{"courses_dept":"econ","courses_id":"500","courseAverage":77.95,"maxFail":1},{"courses_dept":"fren","courses_id":"355","courseAverage":77.96,"maxFail":1},{"courses_dept":"comm","courses_id":"458","courseAverage":77.96,"maxFail":4},{"courses_dept":"asia","courses_id":"398","courseAverage":77.97,"maxFail":2},{"courses_dept":"cohr","courses_id":"307","courseAverage":77.98,"maxFail":0},{"courses_dept":"fnh","courses_id":"342","courseAverage":77.98,"maxFail":1},{"courses_dept":"mtrl","courses_id":"451","courseAverage":77.98,"maxFail":2},{"courses_dept":"astu","courses_id":"360","courseAverage":78,"maxFail":0},{"courses_dept":"law","courses_id":"564","courseAverage":78,"maxFail":0},{"courses_dept":"law","courses_id":"566","courseAverage":78,"maxFail":0},{"courses_dept":"scie","courses_id":"300","courseAverage":78,"maxFail":3},{"courses_dept":"spha","courses_id":"562","courseAverage":78.02,"maxFail":0},{"courses_dept":"mtrl","courses_id":"578","courseAverage":78.03,"maxFail":0},{"courses_dept":"igen","courses_id":"330","courseAverage":78.03,"maxFail":1},{"courses_dept":"span","courses_id":"410","courseAverage":78.03,"maxFail":1},{"courses_dept":"grsj","courses_id":"306","courseAverage":78.04,"maxFail":1},{"courses_dept":"astr","courses_id":"300","courseAverage":78.05,"maxFail":0},{"courses_dept":"comm","courses_id":"497","courseAverage":78.05,"maxFail":1},{"courses_dept":"thtr","courses_id":"323","courseAverage":78.05,"maxFail":1},{"courses_dept":"thtr","courses_id":"210","courseAverage":78.06,"maxFail":2},{"courses_dept":"cpsc","courses_id":"310","courseAverage":78.06,"maxFail":8},{"courses_dept":"biol","courses_id":"430","courseAverage":78.07,"maxFail":1},{"courses_dept":"engl","courses_id":"309","courseAverage":78.07,"maxFail":1},{"courses_dept":"chin","courses_id":"218","courseAverage":78.09,"maxFail":0},{"courses_dept":"engl","courses_id":"301","courseAverage":78.09,"maxFail":2},{"courses_dept":"korn","courses_id":"101","courseAverage":78.1,"maxFail":0},{"courses_dept":"econ","courses_id":"455","courseAverage":78.1,"maxFail":2},{"courses_dept":"apbi","courses_id":"417","courseAverage":78.11,"maxFail":0},{"courses_dept":"dent","courses_id":"505","courseAverage":78.11,"maxFail":0},{"courses_dept":"biol","courses_id":"404","courseAverage":78.11,"maxFail":2},{"courses_dept":"lfs","courses_id":"250","courseAverage":78.11,"maxFail":8},{"courses_dept":"econ","courses_id":"309","courseAverage":78.12,"maxFail":0},{"courses_dept":"visa","courses_id":"340","courseAverage":78.12,"maxFail":3},{"courses_dept":"biol","courses_id":"436","courseAverage":78.13,"maxFail":0},{"courses_dept":"apbi","courses_id":"312","courseAverage":78.13,"maxFail":1},{"courses_dept":"kin","courses_id":"361","courseAverage":78.13,"maxFail":1},{"courses_dept":"musc","courses_id":"323","courseAverage":78.13,"maxFail":2},{"courses_dept":"phys","courses_id":"404","courseAverage":78.13,"maxFail":2},{"courses_dept":"chin","courses_id":"305","courseAverage":78.14,"maxFail":0},{"courses_dept":"ends","courses_id":"281","courseAverage":78.14,"maxFail":1},{"courses_dept":"clst","courses_id":"211","courseAverage":78.14,"maxFail":3},{"courses_dept":"frst","courses_id":"497","courseAverage":78.15,"maxFail":1},{"courses_dept":"germ","courses_id":"303","courseAverage":78.15,"maxFail":1},{"courses_dept":"rmst","courses_id":"234","courseAverage":78.16,"maxFail":0},{"courses_dept":"biol","courses_id":"406","courseAverage":78.16,"maxFail":2},{"courses_dept":"comm","courses_id":"362","courseAverage":78.16,"maxFail":2},{"courses_dept":"kin","courses_id":"571","courseAverage":78.17,"maxFail":1},{"courses_dept":"fren","courses_id":"360","courseAverage":78.18,"maxFail":1},{"courses_dept":"phar","courses_id":"342","courseAverage":78.19,"maxFail":1},{"courses_dept":"fmst","courses_id":"442","courseAverage":78.2,"maxFail":1},{"courses_dept":"ital","courses_id":"301","courseAverage":78.2,"maxFail":1},{"courses_dept":"japn","courses_id":"312","courseAverage":78.23,"maxFail":0},{"courses_dept":"cohr","courses_id":"303","courseAverage":78.24,"maxFail":1},{"courses_dept":"biol","courses_id":"421","courseAverage":78.25,"maxFail":2},{"courses_dept":"arcl","courses_id":"305","courseAverage":78.27,"maxFail":1},{"courses_dept":"comm","courses_id":"445","courseAverage":78.28,"maxFail":1},{"courses_dept":"span","courses_id":"207","courseAverage":78.28,"maxFail":1},{"courses_dept":"relg","courses_id":"101","courseAverage":78.28,"maxFail":4},{"courses_dept":"comm","courses_id":"335","courseAverage":78.29,"maxFail":2},{"courses_dept":"law","courses_id":"506","courseAverage":78.3,"maxFail":0},{"courses_dept":"korn","courses_id":"200","courseAverage":78.3,"maxFail":1},{"courses_dept":"cons","courses_id":"481","courseAverage":78.31,"maxFail":2},{"courses_dept":"biol","courses_id":"416","courseAverage":78.32,"maxFail":2},{"courses_dept":"civl","courses_id":"402","courseAverage":78.33,"maxFail":1},{"courses_dept":"crwr","courses_id":"200","courseAverage":78.33,"maxFail":24},{"courses_dept":"anth","courses_id":"451","courseAverage":78.34,"maxFail":1},{"courses_dept":"chin","courses_id":"317","courseAverage":78.34,"maxFail":1},{"courses_dept":"kin","courses_id":"284","courseAverage":78.34,"maxFail":3},{"courses_dept":"sowk","courses_id":"200","courseAverage":78.34,"maxFail":3},{"courses_dept":"musc","courses_id":"440","courseAverage":78.35,"maxFail":0},{"courses_dept":"nurs","courses_id":"595","courseAverage":78.35,"maxFail":0},{"courses_dept":"chin","courses_id":"315","courseAverage":78.36,"maxFail":0},{"courses_dept":"span","courses_id":"357","courseAverage":78.37,"maxFail":0},{"courses_dept":"arch","courses_id":"541","courseAverage":78.37,"maxFail":1},{"courses_dept":"biol","courses_id":"343","courseAverage":78.38,"maxFail":1},{"courses_dept":"math","courses_id":"120","courseAverage":78.38,"maxFail":2},{"courses_dept":"chbe","courses_id":"419","courseAverage":78.41,"maxFail":0},{"courses_dept":"cons","courses_id":"210","courseAverage":78.42,"maxFail":2},{"courses_dept":"law","courses_id":"562","courseAverage":78.44,"maxFail":0},{"courses_dept":"phys","courses_id":"474","courseAverage":78.44,"maxFail":1},{"courses_dept":"mtrl","courses_id":"460","courseAverage":78.46,"maxFail":0},{"courses_dept":"biol","courses_id":"446","courseAverage":78.49,"maxFail":0},{"courses_dept":"bioc","courses_id":"440","courseAverage":78.5,"maxFail":0},{"courses_dept":"frst","courses_id":"436","courseAverage":78.5,"maxFail":0},{"courses_dept":"civl","courses_id":"413","courseAverage":78.5,"maxFail":1},{"courses_dept":"arch","courses_id":"504","courseAverage":78.51,"maxFail":1},{"courses_dept":"fipr","courses_id":"337","courseAverage":78.51,"maxFail":1},{"courses_dept":"fren","courses_id":"225","courseAverage":78.52,"maxFail":0},{"courses_dept":"germ","courses_id":"210","courseAverage":78.53,"maxFail":1},{"courses_dept":"libr","courses_id":"529","courseAverage":78.53,"maxFail":1},{"courses_dept":"chbe","courses_id":"484","courseAverage":78.53,"maxFail":2},{"courses_dept":"busi","courses_id":"335","courseAverage":78.53,"maxFail":9},{"courses_dept":"port","courses_id":"202","courseAverage":78.54,"maxFail":0},{"courses_dept":"rmes","courses_id":"516","courseAverage":78.54,"maxFail":0},{"courses_dept":"mech","courses_id":"436","courseAverage":78.55,"maxFail":0},{"courses_dept":"fist","courses_id":"331","courseAverage":78.55,"maxFail":1},{"courses_dept":"nurs","courses_id":"335","courseAverage":78.56,"maxFail":1},{"courses_dept":"comm","courses_id":"444","courseAverage":78.57,"maxFail":0},{"courses_dept":"germ","courses_id":"200","courseAverage":78.57,"maxFail":3},{"courses_dept":"grsj","courses_id":"102","courseAverage":78.57,"maxFail":5},{"courses_dept":"apbi","courses_id":"316","courseAverage":78.58,"maxFail":0},{"courses_dept":"biol","courses_id":"434","courseAverage":78.58,"maxFail":0},{"courses_dept":"asia","courses_id":"305","courseAverage":78.58,"maxFail":3},{"courses_dept":"visa","courses_id":"331","courseAverage":78.59,"maxFail":0},{"courses_dept":"cogs","courses_id":"300","courseAverage":78.59,"maxFail":1},{"courses_dept":"cohr","courses_id":"404","courseAverage":78.59,"maxFail":1},{"courses_dept":"germ","courses_id":"110","courseAverage":78.59,"maxFail":10},{"courses_dept":"crwr","courses_id":"208","courseAverage":78.6,"maxFail":6},{"courses_dept":"mtrl","courses_id":"472","courseAverage":78.63,"maxFail":0},{"courses_dept":"lfs","courses_id":"252","courseAverage":78.63,"maxFail":11},{"courses_dept":"mech","courses_id":"368","courseAverage":78.64,"maxFail":3},{"courses_dept":"food","courses_id":"523","courseAverage":78.66,"maxFail":1},{"courses_dept":"eosc","courses_id":"472","courseAverage":78.66,"maxFail":2},{"courses_dept":"comm","courses_id":"462","courseAverage":78.67,"maxFail":0},{"courses_dept":"mtrl","courses_id":"559","courseAverage":78.67,"maxFail":0},{"courses_dept":"comm","courses_id":"377","courseAverage":78.67,"maxFail":2},{"courses_dept":"hgse","courses_id":"356","courseAverage":78.68,"maxFail":0},{"courses_dept":"chem","courses_id":"411","courseAverage":78.69,"maxFail":1},{"courses_dept":"mtrl","courses_id":"381","courseAverage":78.69,"maxFail":1},{"courses_dept":"visa","courses_id":"481","courseAverage":78.69,"maxFail":1},{"courses_dept":"chin","courses_id":"413","courseAverage":78.7,"maxFail":0},{"courses_dept":"engl","courses_id":"310","courseAverage":78.7,"maxFail":1},{"courses_dept":"micb","courses_id":"402","courseAverage":78.7,"maxFail":2},{"courses_dept":"fnh","courses_id":"451","courseAverage":78.71,"maxFail":0},{"courses_dept":"chin","courses_id":"205","courseAverage":78.71,"maxFail":1},{"courses_dept":"chin","courses_id":"411","courseAverage":78.72,"maxFail":1},{"courses_dept":"kin","courses_id":"464","courseAverage":78.72,"maxFail":1},{"courses_dept":"eosc","courses_id":"474","courseAverage":78.72,"maxFail":3},{"courses_dept":"phys","courses_id":"410","courseAverage":78.73,"maxFail":5},{"courses_dept":"busi","courses_id":"493","courseAverage":78.74,"maxFail":0},{"courses_dept":"cohr","courses_id":"405","courseAverage":78.78,"maxFail":0},{"courses_dept":"fre","courses_id":"502","courseAverage":78.78,"maxFail":0},{"courses_dept":"mine","courses_id":"486","courseAverage":78.78,"maxFail":0},{"courses_dept":"span","courses_id":"280","courseAverage":78.78,"maxFail":0},{"courses_dept":"crwr","courses_id":"209","courseAverage":78.78,"maxFail":6},{"courses_dept":"fist","courses_id":"338","courseAverage":78.79,"maxFail":0},{"courses_dept":"fnh","courses_id":"355","courseAverage":78.79,"maxFail":7},{"courses_dept":"musc","courses_id":"141","courseAverage":78.8,"maxFail":2},{"courses_dept":"chbe","courses_id":"457","courseAverage":78.81,"maxFail":1},{"courses_dept":"civl","courses_id":"415","courseAverage":78.84,"maxFail":0},{"courses_dept":"phys","courses_id":"107","courseAverage":78.84,"maxFail":9},{"courses_dept":"law","courses_id":"430","courseAverage":78.85,"maxFail":1},{"courses_dept":"apbi","courses_id":"428","courseAverage":78.85,"maxFail":2},{"courses_dept":"kin","courses_id":"303","courseAverage":78.87,"maxFail":0},{"courses_dept":"apbi","courses_id":"311","courseAverage":78.87,"maxFail":1},{"courses_dept":"comm","courses_id":"657","courseAverage":78.88,"maxFail":0},{"courses_dept":"law","courses_id":"444","courseAverage":78.88,"maxFail":0},{"courses_dept":"phys","courses_id":"304","courseAverage":78.88,"maxFail":10},{"courses_dept":"frst","courses_id":"439","courseAverage":78.89,"maxFail":5},{"courses_dept":"arch","courses_id":"404","courseAverage":78.9,"maxFail":0},{"courses_dept":"astr","courses_id":"404","courseAverage":78.9,"maxFail":0},{"courses_dept":"isci","courses_id":"422","courseAverage":78.9,"maxFail":1},{"courses_dept":"adhe","courses_id":"328","courseAverage":78.91,"maxFail":0},{"courses_dept":"chin","courses_id":"307","courseAverage":78.92,"maxFail":0},{"courses_dept":"biol","courses_id":"458","courseAverage":78.92,"maxFail":1},{"courses_dept":"civl","courses_id":"316","courseAverage":78.92,"maxFail":1},{"courses_dept":"phys","courses_id":"407","courseAverage":78.92,"maxFail":3},{"courses_dept":"apbi","courses_id":"360","courseAverage":78.94,"maxFail":1},{"courses_dept":"phil","courses_id":"364","courseAverage":78.94,"maxFail":1},{"courses_dept":"fist","courses_id":"230","courseAverage":78.95,"maxFail":2},{"courses_dept":"phys","courses_id":"400","courseAverage":78.95,"maxFail":3},{"courses_dept":"mech","courses_id":"469","courseAverage":78.96,"maxFail":0},{"courses_dept":"mine","courses_id":"462","courseAverage":78.96,"maxFail":1},{"courses_dept":"engl","courses_id":"231","courseAverage":78.97,"maxFail":0},{"courses_dept":"eosc","courses_id":"328","courseAverage":78.97,"maxFail":0},{"courses_dept":"comm","courses_id":"436","courseAverage":78.98,"maxFail":0},{"courses_dept":"frst","courses_id":"270","courseAverage":78.99,"maxFail":1},{"courses_dept":"engl","courses_id":"328","courseAverage":78.99,"maxFail":2},{"courses_dept":"arbc","courses_id":"102","courseAverage":79,"maxFail":0},{"courses_dept":"law","courses_id":"409","courseAverage":79,"maxFail":0},{"courses_dept":"law","courses_id":"412","courseAverage":79,"maxFail":0},{"courses_dept":"phys","courses_id":"319","courseAverage":79,"maxFail":1},{"courses_dept":"spha","courses_id":"503","courseAverage":79,"maxFail":2},{"courses_dept":"comm","courses_id":"482","courseAverage":79.02,"maxFail":0},{"courses_dept":"mech","courses_id":"366","courseAverage":79.02,"maxFail":0},{"courses_dept":"port","courses_id":"101","courseAverage":79.02,"maxFail":2},{"courses_dept":"ends","courses_id":"420","courseAverage":79.02,"maxFail":3},{"courses_dept":"law","courses_id":"466","courseAverage":79.03,"maxFail":0},{"courses_dept":"bioc","courses_id":"301","courseAverage":79.03,"maxFail":1},{"courses_dept":"biol","courses_id":"425","courseAverage":79.03,"maxFail":1},{"courses_dept":"germ","courses_id":"433","courseAverage":79.03,"maxFail":2},{"courses_dept":"musc","courses_id":"131","courseAverage":79.04,"maxFail":0},{"courses_dept":"arth","courses_id":"432","courseAverage":79.04,"maxFail":3},{"courses_dept":"ceen","courses_id":"501","courseAverage":79.05,"maxFail":0},{"courses_dept":"grek","courses_id":"102","courseAverage":79.05,"maxFail":0},{"courses_dept":"cpsc","courses_id":"344","courseAverage":79.05,"maxFail":1},{"courses_dept":"ends","courses_id":"302","courseAverage":79.05,"maxFail":2},{"courses_dept":"germ","courses_id":"304","courseAverage":79.05,"maxFail":2},{"courses_dept":"latn","courses_id":"350","courseAverage":79.05,"maxFail":2},{"courses_dept":"phys","courses_id":"108","courseAverage":79.06,"maxFail":4},{"courses_dept":"mtrl","courses_id":"466","courseAverage":79.07,"maxFail":0},{"courses_dept":"fre","courses_id":"340","courseAverage":79.07,"maxFail":1},{"courses_dept":"law","courses_id":"305","courseAverage":79.08,"maxFail":0},{"courses_dept":"mine","courses_id":"291","courseAverage":79.08,"maxFail":0},{"courses_dept":"relg","courses_id":"414","courseAverage":79.08,"maxFail":0},{"courses_dept":"comm","courses_id":"459","courseAverage":79.08,"maxFail":1},{"courses_dept":"biol","courses_id":"340","courseAverage":79.08,"maxFail":2},{"courses_dept":"grsj","courses_id":"327","courseAverage":79.09,"maxFail":0},{"courses_dept":"law","courses_id":"353","courseAverage":79.09,"maxFail":0},{"courses_dept":"cics","courses_id":"520","courseAverage":79.1,"maxFail":1},{"courses_dept":"mtrl","courses_id":"571","courseAverage":79.1,"maxFail":1},{"courses_dept":"asia","courses_id":"498","courseAverage":79.11,"maxFail":0},{"courses_dept":"comm","courses_id":"398","courseAverage":79.11,"maxFail":0},{"courses_dept":"law","courses_id":"374","courseAverage":79.11,"maxFail":0},{"courses_dept":"law","courses_id":"473","courseAverage":79.12,"maxFail":0},{"courses_dept":"relg","courses_id":"415","courseAverage":79.12,"maxFail":0},{"courses_dept":"visa","courses_id":"360","courseAverage":79.12,"maxFail":0},{"courses_dept":"kin","courses_id":"381","courseAverage":79.13,"maxFail":0},{"courses_dept":"ital","courses_id":"403","courseAverage":79.13,"maxFail":1},{"courses_dept":"germ","courses_id":"302","courseAverage":79.13,"maxFail":2},{"courses_dept":"eosc","courses_id":"332","courseAverage":79.14,"maxFail":1},{"courses_dept":"asia","courses_id":"457","courseAverage":79.16,"maxFail":0},{"courses_dept":"cons","courses_id":"486","courseAverage":79.16,"maxFail":0},{"courses_dept":"apsc","courses_id":"261","courseAverage":79.16,"maxFail":4},{"courses_dept":"busi","courses_id":"452","courseAverage":79.16,"maxFail":6},{"courses_dept":"mtrl","courses_id":"361","courseAverage":79.17,"maxFail":0},{"courses_dept":"cohr","courses_id":"401","courseAverage":79.17,"maxFail":1},{"courses_dept":"cpsc","courses_id":"444","courseAverage":79.19,"maxFail":1},{"courses_dept":"pers","courses_id":"201","courseAverage":79.2,"maxFail":0},{"courses_dept":"wood","courses_id":"249","courseAverage":79.2,"maxFail":0},{"courses_dept":"civl","courses_id":"416","courseAverage":79.21,"maxFail":1},{"courses_dept":"fre","courses_id":"528","courseAverage":79.23,"maxFail":0},{"courses_dept":"phar","courses_id":"472","courseAverage":79.23,"maxFail":0},{"courses_dept":"fnh","courses_id":"471","courseAverage":79.23,"maxFail":1},{"courses_dept":"path","courses_id":"404","courseAverage":79.24,"maxFail":0},{"courses_dept":"chem","courses_id":"335","courseAverage":79.25,"maxFail":0},{"courses_dept":"cohr","courses_id":"433","courseAverage":79.26,"maxFail":0},{"courses_dept":"dhyg","courses_id":"206","courseAverage":79.26,"maxFail":0},{"courses_dept":"dhyg","courses_id":"208","courseAverage":79.26,"maxFail":0},{"courses_dept":"law","courses_id":"470","courseAverage":79.26,"maxFail":0},{"courses_dept":"envr","courses_id":"420","courseAverage":79.27,"maxFail":0},{"courses_dept":"thtr","courses_id":"310","courseAverage":79.27,"maxFail":0},{"courses_dept":"bioc","courses_id":"450","courseAverage":79.28,"maxFail":0},{"courses_dept":"bmeg","courses_id":"410","courseAverage":79.28,"maxFail":0},{"courses_dept":"name","courses_id":"566","courseAverage":79.28,"maxFail":0},{"courses_dept":"law","courses_id":"560","courseAverage":79.29,"maxFail":0},{"courses_dept":"span","courses_id":"364","courseAverage":79.29,"maxFail":0},{"courses_dept":"arch","courses_id":"403","courseAverage":79.3,"maxFail":0},{"courses_dept":"chbe","courses_id":"459","courseAverage":79.3,"maxFail":1},{"courses_dept":"arch","courses_id":"523","courseAverage":79.3,"maxFail":2},{"courses_dept":"civl","courses_id":"404","courseAverage":79.31,"maxFail":0},{"courses_dept":"biol","courses_id":"342","courseAverage":79.32,"maxFail":0},{"courses_dept":"larc","courses_id":"522","courseAverage":79.32,"maxFail":4},{"courses_dept":"math","courses_id":"405","courseAverage":79.33,"maxFail":3},{"courses_dept":"cpsc","courses_id":"411","courseAverage":79.34,"maxFail":1},{"courses_dept":"civl","courses_id":"331","courseAverage":79.34,"maxFail":5},{"courses_dept":"civl","courses_id":"566","courseAverage":79.35,"maxFail":0},{"courses_dept":"medg","courses_id":"419","courseAverage":79.35,"maxFail":0},{"courses_dept":"fre","courses_id":"503","courseAverage":79.36,"maxFail":0},{"courses_dept":"poli","courses_id":"334","courseAverage":79.37,"maxFail":1},{"courses_dept":"isci","courses_id":"433","courseAverage":79.39,"maxFail":0},{"courses_dept":"path","courses_id":"327","courseAverage":79.39,"maxFail":0},{"courses_dept":"mech","courses_id":"463","courseAverage":79.39,"maxFail":7},{"courses_dept":"micb","courses_id":"401","courseAverage":79.4,"maxFail":0},{"courses_dept":"russ","courses_id":"206","courseAverage":79.41,"maxFail":1},{"courses_dept":"cohr","courses_id":"304","courseAverage":79.42,"maxFail":0},{"courses_dept":"baac","courses_id":"500","courseAverage":79.42,"maxFail":2},{"courses_dept":"civl","courses_id":"574","courseAverage":79.43,"maxFail":1},{"courses_dept":"envr","courses_id":"200","courseAverage":79.43,"maxFail":2},{"courses_dept":"baac","courses_id":"510","courseAverage":79.44,"maxFail":2},{"courses_dept":"korn","courses_id":"302","courseAverage":79.45,"maxFail":0},{"courses_dept":"mech","courses_id":"420","courseAverage":79.45,"maxFail":1},{"courses_dept":"asia","courses_id":"341","courseAverage":79.46,"maxFail":0},{"courses_dept":"civl","courses_id":"513","courseAverage":79.47,"maxFail":1},{"courses_dept":"fre","courses_id":"501","courseAverage":79.49,"maxFail":0},{"courses_dept":"clch","courses_id":"389","courseAverage":79.5,"maxFail":0},{"courses_dept":"path","courses_id":"306","courseAverage":79.51,"maxFail":0},{"courses_dept":"arch","courses_id":"532","courseAverage":79.51,"maxFail":2},{"courses_dept":"mech","courses_id":"481","courseAverage":79.52,"maxFail":1},{"courses_dept":"eosc","courses_id":"575","courseAverage":79.54,"maxFail":0},{"courses_dept":"biol","courses_id":"337","courseAverage":79.55,"maxFail":1},{"courses_dept":"wood","courses_id":"492","courseAverage":79.55,"maxFail":1},{"courses_dept":"fnh","courses_id":"370","courseAverage":79.55,"maxFail":2},{"courses_dept":"econ","courses_id":"490","courseAverage":79.55,"maxFail":5},{"courses_dept":"ling","courses_id":"451","courseAverage":79.56,"maxFail":1},{"courses_dept":"itst","courses_id":"419","courseAverage":79.57,"maxFail":2},{"courses_dept":"enph","courses_id":"259","courseAverage":79.57,"maxFail":3},{"courses_dept":"cnps","courses_id":"427","courseAverage":79.57,"maxFail":7},{"courses_dept":"atsc","courses_id":"405","courseAverage":79.58,"maxFail":0},{"courses_dept":"phar","courses_id":"303","courseAverage":79.58,"maxFail":2},{"courses_dept":"arcl","courses_id":"309","courseAverage":79.59,"maxFail":0},{"courses_dept":"germ","courses_id":"360","courseAverage":79.59,"maxFail":0},{"courses_dept":"law","courses_id":"457","courseAverage":79.59,"maxFail":0},{"courses_dept":"swed","courses_id":"200","courseAverage":79.59,"maxFail":1},{"courses_dept":"ba","courses_id":"504","courseAverage":79.6,"maxFail":0},{"courses_dept":"fnh","courses_id":"477","courseAverage":79.6,"maxFail":0},{"courses_dept":"sowk","courses_id":"621","courseAverage":79.6,"maxFail":0},{"courses_dept":"biol","courses_id":"310","courseAverage":79.62,"maxFail":1},{"courses_dept":"cens","courses_id":"202","courseAverage":79.63,"maxFail":3},{"courses_dept":"chem","courses_id":"427","courseAverage":79.65,"maxFail":1},{"courses_dept":"civl","courses_id":"409","courseAverage":79.66,"maxFail":0},{"courses_dept":"grek","courses_id":"351","courseAverage":79.67,"maxFail":0},{"courses_dept":"mech","courses_id":"578","courseAverage":79.67,"maxFail":0},{"courses_dept":"grsj","courses_id":"401","courseAverage":79.68,"maxFail":0},{"courses_dept":"relg","courses_id":"305","courseAverage":79.69,"maxFail":0},{"courses_dept":"thtr","courses_id":"406","courseAverage":79.7,"maxFail":0},{"courses_dept":"germ","courses_id":"310","courseAverage":79.7,"maxFail":1},{"courses_dept":"basc","courses_id":"550","courseAverage":79.71,"maxFail":1},{"courses_dept":"arch","courses_id":"437","courseAverage":79.72,"maxFail":0},{"courses_dept":"biol","courses_id":"441","courseAverage":79.74,"maxFail":0},{"courses_dept":"comm","courses_id":"437","courseAverage":79.74,"maxFail":0},{"courses_dept":"apbi","courses_id":"322","courseAverage":79.74,"maxFail":1},{"courses_dept":"ital","courses_id":"302","courseAverage":79.74,"maxFail":1},{"courses_dept":"law","courses_id":"336","courseAverage":79.76,"maxFail":0},{"courses_dept":"musc","courses_id":"349","courseAverage":79.76,"maxFail":0},{"courses_dept":"itst","courses_id":"333","courseAverage":79.77,"maxFail":0},{"courses_dept":"bama","courses_id":"503","courseAverage":79.78,"maxFail":0},{"courses_dept":"arth","courses_id":"443","courseAverage":79.79,"maxFail":0},{"courses_dept":"civl","courses_id":"433","courseAverage":79.79,"maxFail":3},{"courses_dept":"asia","courses_id":"488","courseAverage":79.8,"maxFail":1},{"courses_dept":"path","courses_id":"301","courseAverage":79.81,"maxFail":0},{"courses_dept":"dent","courses_id":"430","courseAverage":79.81,"maxFail":1},{"courses_dept":"fipr","courses_id":"330","courseAverage":79.82,"maxFail":0},{"courses_dept":"eosc","courses_id":"333","courseAverage":79.83,"maxFail":1},{"courses_dept":"phar","courses_id":"341","courseAverage":79.83,"maxFail":1},{"courses_dept":"dhyg","courses_id":"106","courseAverage":79.83,"maxFail":3},{"courses_dept":"dhyg","courses_id":"325","courseAverage":79.84,"maxFail":0},{"courses_dept":"mech","courses_id":"478","courseAverage":79.84,"maxFail":0},{"courses_dept":"fre","courses_id":"490","courseAverage":79.84,"maxFail":1},{"courses_dept":"cohr","courses_id":"402","courseAverage":79.85,"maxFail":1},{"courses_dept":"mine","courses_id":"432","courseAverage":79.85,"maxFail":1},{"courses_dept":"arbc","courses_id":"201","courseAverage":79.86,"maxFail":0},{"courses_dept":"mech","courses_id":"495","courseAverage":79.86,"maxFail":4},{"courses_dept":"biol","courses_id":"438","courseAverage":79.87,"maxFail":0},{"courses_dept":"ends","courses_id":"320","courseAverage":79.88,"maxFail":0},{"courses_dept":"math","courses_id":"360","courseAverage":79.88,"maxFail":0},{"courses_dept":"fhis","courses_id":"333","courseAverage":79.89,"maxFail":0},{"courses_dept":"pols","courses_id":"424","courseAverage":79.9,"maxFail":0},{"courses_dept":"fipr","courses_id":"230","courseAverage":79.92,"maxFail":0},{"courses_dept":"larc","courses_id":"502","courseAverage":79.92,"maxFail":0},{"courses_dept":"comm","courses_id":"477","courseAverage":79.92,"maxFail":1},{"courses_dept":"span","courses_id":"402","courseAverage":79.92,"maxFail":1},{"courses_dept":"asia","courses_id":"309","courseAverage":79.93,"maxFail":2},{"courses_dept":"bams","courses_id":"550","courseAverage":79.95,"maxFail":0},{"courses_dept":"kin","courses_id":"360","courseAverage":79.95,"maxFail":1},{"courses_dept":"comm","courses_id":"467","courseAverage":79.96,"maxFail":0},{"courses_dept":"sowk","courses_id":"522","courseAverage":79.96,"maxFail":0},{"courses_dept":"adhe","courses_id":"412","courseAverage":79.96,"maxFail":3},{"courses_dept":"civl","courses_id":"300","courseAverage":79.97,"maxFail":1},{"courses_dept":"arch","courses_id":"515","courseAverage":79.98,"maxFail":1},{"courses_dept":"biol","courses_id":"415","courseAverage":79.99,"maxFail":1},{"courses_dept":"geog","courses_id":"412","courseAverage":79.99,"maxFail":1},{"courses_dept":"germ","courses_id":"410","courseAverage":79.99,"maxFail":1},{"courses_dept":"civl","courses_id":"311","courseAverage":80,"maxFail":3},{"courses_dept":"civl","courses_id":"569","courseAverage":80.01,"maxFail":0},{"courses_dept":"civl","courses_id":"582","courseAverage":80.02,"maxFail":0},{"courses_dept":"basc","courses_id":"523","courseAverage":80.03,"maxFail":0},{"courses_dept":"port","courses_id":"201","courseAverage":80.03,"maxFail":0},{"courses_dept":"soil","courses_id":"520","courseAverage":80.03,"maxFail":0},{"courses_dept":"phys","courses_id":"502","courseAverage":80.04,"maxFail":2},{"courses_dept":"asia","courses_id":"378","courseAverage":80.1,"maxFail":0},{"courses_dept":"ends","courses_id":"301","courseAverage":80.1,"maxFail":0},{"courses_dept":"food","courses_id":"510","courseAverage":80.1,"maxFail":0},{"courses_dept":"mine","courses_id":"493","courseAverage":80.1,"maxFail":0},{"courses_dept":"mine","courses_id":"480","courseAverage":80.11,"maxFail":1},{"courses_dept":"frst","courses_id":"443","courseAverage":80.11,"maxFail":2},{"courses_dept":"kin","courses_id":"382","courseAverage":80.12,"maxFail":1},{"courses_dept":"civl","courses_id":"520","courseAverage":80.13,"maxFail":0},{"courses_dept":"germ","courses_id":"300","courseAverage":80.13,"maxFail":0},{"courses_dept":"eosc","courses_id":"533","courseAverage":80.13,"maxFail":1},{"courses_dept":"mech","courses_id":"392","courseAverage":80.13,"maxFail":1},{"courses_dept":"baac","courses_id":"511","courseAverage":80.14,"maxFail":1},{"courses_dept":"biol","courses_id":"341","courseAverage":80.14,"maxFail":1},{"courses_dept":"astr","courses_id":"407","courseAverage":80.16,"maxFail":0},{"courses_dept":"food","courses_id":"528","courseAverage":80.16,"maxFail":0},{"courses_dept":"biol","courses_id":"456","courseAverage":80.16,"maxFail":1},{"courses_dept":"civl","courses_id":"439","courseAverage":80.17,"maxFail":1},{"courses_dept":"engl","courses_id":"490","courseAverage":80.17,"maxFail":4},{"courses_dept":"eosc","courses_id":"512","courseAverage":80.18,"maxFail":0},{"courses_dept":"mech","courses_id":"563","courseAverage":80.18,"maxFail":1},{"courses_dept":"fnh","courses_id":"413","courseAverage":80.19,"maxFail":0},{"courses_dept":"frst","courses_id":"432","courseAverage":80.19,"maxFail":0},{"courses_dept":"name","courses_id":"578","courseAverage":80.19,"maxFail":0},{"courses_dept":"eosc","courses_id":"420","courseAverage":80.19,"maxFail":1},{"courses_dept":"eosc","courses_id":"434","courseAverage":80.19,"maxFail":1},{"courses_dept":"musc","courses_id":"135","courseAverage":80.2,"maxFail":1},{"courses_dept":"mech","courses_id":"445","courseAverage":80.22,"maxFail":0},{"courses_dept":"civl","courses_id":"420","courseAverage":80.22,"maxFail":1},{"courses_dept":"stat","courses_id":"461","courseAverage":80.22,"maxFail":1},{"courses_dept":"thtr","courses_id":"306","courseAverage":80.22,"maxFail":1},{"courses_dept":"ba","courses_id":"541","courseAverage":80.23,"maxFail":1},{"courses_dept":"fnh","courses_id":"473","courseAverage":80.24,"maxFail":0},{"courses_dept":"cons","courses_id":"370","courseAverage":80.25,"maxFail":1},{"courses_dept":"crwr","courses_id":"206","courseAverage":80.25,"maxFail":7},{"courses_dept":"path","courses_id":"300","courseAverage":80.27,"maxFail":0},{"courses_dept":"bafi","courses_id":"530","courseAverage":80.28,"maxFail":0},{"courses_dept":"fnh","courses_id":"302","courseAverage":80.28,"maxFail":0},{"courses_dept":"russ","courses_id":"207","courseAverage":80.29,"maxFail":2},{"courses_dept":"germ","courses_id":"100","courseAverage":80.29,"maxFail":17},{"courses_dept":"frst","courses_id":"310","courseAverage":80.3,"maxFail":0},{"courses_dept":"eece","courses_id":"566","courseAverage":80.3,"maxFail":1},{"courses_dept":"apbi","courses_id":"315","courseAverage":80.3,"maxFail":3},{"courses_dept":"frst","courses_id":"495","courseAverage":80.31,"maxFail":0},{"courses_dept":"mtrl","courses_id":"585","courseAverage":80.31,"maxFail":1},{"courses_dept":"dent","courses_id":"440","courseAverage":80.32,"maxFail":0},{"courses_dept":"cnps","courses_id":"365","courseAverage":80.32,"maxFail":7},{"courses_dept":"arch","courses_id":"513","courseAverage":80.33,"maxFail":0},{"courses_dept":"baac","courses_id":"550","courseAverage":80.35,"maxFail":0},{"courses_dept":"hist","courses_id":"394","courseAverage":80.35,"maxFail":0},{"courses_dept":"thtr","courses_id":"250","courseAverage":80.35,"maxFail":0},{"courses_dept":"bama","courses_id":"550","courseAverage":80.37,"maxFail":0},{"courses_dept":"hgse","courses_id":"351","courseAverage":80.38,"maxFail":0},{"courses_dept":"urst","courses_id":"400","courseAverage":80.39,"maxFail":0},{"courses_dept":"eosc","courses_id":"330","courseAverage":80.39,"maxFail":1},{"courses_dept":"path","courses_id":"427","courseAverage":80.39,"maxFail":1},{"courses_dept":"frst","courses_id":"452","courseAverage":80.41,"maxFail":0},{"courses_dept":"fre","courses_id":"420","courseAverage":80.41,"maxFail":2},{"courses_dept":"kin","courses_id":"373","courseAverage":80.44,"maxFail":6},{"courses_dept":"comm","courses_id":"447","courseAverage":80.45,"maxFail":0},{"courses_dept":"medg","courses_id":"420","courseAverage":80.46,"maxFail":1},{"courses_dept":"phys","courses_id":"159","courseAverage":80.47,"maxFail":3},{"courses_dept":"path","courses_id":"304","courseAverage":80.48,"maxFail":1},{"courses_dept":"comm","courses_id":"471","courseAverage":80.49,"maxFail":0},{"courses_dept":"eosc","courses_id":"450","courseAverage":80.49,"maxFail":0},{"courses_dept":"law","courses_id":"530","courseAverage":80.49,"maxFail":0},{"courses_dept":"dent","courses_id":"568","courseAverage":80.5,"maxFail":0},{"courses_dept":"enph","courses_id":"481","courseAverage":80.5,"maxFail":0},{"courses_dept":"cohr","courses_id":"411","courseAverage":80.51,"maxFail":1},{"courses_dept":"pers","courses_id":"101","courseAverage":80.52,"maxFail":0},{"courses_dept":"eece","courses_id":"532","courseAverage":80.54,"maxFail":1},{"courses_dept":"adhe","courses_id":"329","courseAverage":80.55,"maxFail":4},{"courses_dept":"phys","courses_id":"560","courseAverage":80.57,"maxFail":0},{"courses_dept":"frst","courses_id":"424","courseAverage":80.59,"maxFail":0},{"courses_dept":"hgse","courses_id":"354","courseAverage":80.59,"maxFail":0},{"courses_dept":"civl","courses_id":"561","courseAverage":80.6,"maxFail":0},{"courses_dept":"surg","courses_id":"514","courseAverage":80.6,"maxFail":0},{"courses_dept":"fnh","courses_id":"455","courseAverage":80.6,"maxFail":1},{"courses_dept":"apbi","courses_id":"415","courseAverage":80.61,"maxFail":0},{"courses_dept":"wood","courses_id":"499","courseAverage":80.61,"maxFail":0},{"courses_dept":"germ","courses_id":"400","courseAverage":80.62,"maxFail":2},{"courses_dept":"mine","courses_id":"556","courseAverage":80.63,"maxFail":0},{"courses_dept":"spha","courses_id":"532","courseAverage":80.63,"maxFail":0},{"courses_dept":"udes","courses_id":"504","courseAverage":80.63,"maxFail":0},{"courses_dept":"biol","courses_id":"413","courseAverage":80.63,"maxFail":2},{"courses_dept":"path","courses_id":"477","courseAverage":80.64,"maxFail":0},{"courses_dept":"kin","courses_id":"161","courseAverage":80.65,"maxFail":1},{"courses_dept":"phys","courses_id":"501","courseAverage":80.65,"maxFail":1},{"courses_dept":"bama","courses_id":"541","courseAverage":80.67,"maxFail":0},{"courses_dept":"comm","courses_id":"431","courseAverage":80.68,"maxFail":1},{"courses_dept":"libr","courses_id":"587","courseAverage":80.68,"maxFail":1},{"courses_dept":"biol","courses_id":"326","courseAverage":80.69,"maxFail":0},{"courses_dept":"eece","courses_id":"569","courseAverage":80.69,"maxFail":0},{"courses_dept":"civl","courses_id":"301","courseAverage":80.69,"maxFail":6},{"courses_dept":"eosc","courses_id":"473","courseAverage":80.71,"maxFail":0},{"courses_dept":"larc","courses_id":"523","courseAverage":80.71,"maxFail":0},{"courses_dept":"arch","courses_id":"511","courseAverage":80.71,"maxFail":1},{"courses_dept":"nest","courses_id":"304","courseAverage":80.71,"maxFail":1},{"courses_dept":"arth","courses_id":"376","courseAverage":80.72,"maxFail":2},{"courses_dept":"mtrl","courses_id":"359","courseAverage":80.73,"maxFail":4},{"courses_dept":"comm","courses_id":"412","courseAverage":80.74,"maxFail":1},{"courses_dept":"thtr","courses_id":"354","courseAverage":80.74,"maxFail":1},{"courses_dept":"baen","courses_id":"541","courseAverage":80.75,"maxFail":0},{"courses_dept":"grek","courses_id":"202","courseAverage":80.75,"maxFail":0},{"courses_dept":"phil","courses_id":"599","courseAverage":80.75,"maxFail":0},{"courses_dept":"mech","courses_id":"479","courseAverage":80.75,"maxFail":1},{"courses_dept":"phar","courses_id":"454","courseAverage":80.75,"maxFail":1},{"courses_dept":"midw","courses_id":"125","courseAverage":80.76,"maxFail":0},{"courses_dept":"phys","courses_id":"210","courseAverage":80.76,"maxFail":5},{"courses_dept":"ling","courses_id":"445","courseAverage":80.77,"maxFail":1},{"courses_dept":"bmeg","courses_id":"510","courseAverage":80.78,"maxFail":0},{"courses_dept":"nurs","courses_id":"511","courseAverage":80.78,"maxFail":0},{"courses_dept":"rmes","courses_id":"518","courseAverage":80.78,"maxFail":0},{"courses_dept":"path","courses_id":"305","courseAverage":80.79,"maxFail":0},{"courses_dept":"math","courses_id":"335","courseAverage":80.79,"maxFail":1},{"courses_dept":"law","courses_id":"567","courseAverage":80.8,"maxFail":0},{"courses_dept":"spha","courses_id":"511","courseAverage":80.8,"maxFail":0},{"courses_dept":"bahr","courses_id":"508","courseAverage":80.81,"maxFail":0},{"courses_dept":"food","courses_id":"522","courseAverage":80.81,"maxFail":0},{"courses_dept":"mech","courses_id":"489","courseAverage":80.81,"maxFail":0},{"courses_dept":"eosc","courses_id":"445","courseAverage":80.81,"maxFail":1},{"courses_dept":"cons","courses_id":"452","courseAverage":80.82,"maxFail":0},{"courses_dept":"educ","courses_id":"210","courseAverage":80.83,"maxFail":0},{"courses_dept":"ends","courses_id":"402","courseAverage":80.83,"maxFail":0},{"courses_dept":"fipr","courses_id":"437","courseAverage":80.83,"maxFail":0},{"courses_dept":"arth","courses_id":"377","courseAverage":80.83,"maxFail":2},{"courses_dept":"math","courses_id":"418","courseAverage":80.84,"maxFail":0},{"courses_dept":"relg","courses_id":"308","courseAverage":80.84,"maxFail":1},{"courses_dept":"bams","courses_id":"503","courseAverage":80.85,"maxFail":0},{"courses_dept":"phys","courses_id":"219","courseAverage":80.85,"maxFail":3},{"courses_dept":"arbc","courses_id":"101","courseAverage":80.86,"maxFail":2},{"courses_dept":"bapa","courses_id":"501","courseAverage":80.87,"maxFail":0},{"courses_dept":"libr","courses_id":"533","courseAverage":80.88,"maxFail":0},{"courses_dept":"civl","courses_id":"435","courseAverage":80.88,"maxFail":1},{"courses_dept":"wood","courses_id":"440","courseAverage":80.88,"maxFail":1},{"courses_dept":"dhyg","courses_id":"310","courseAverage":80.89,"maxFail":0},{"courses_dept":"eece","courses_id":"553","courseAverage":80.89,"maxFail":0},{"courses_dept":"math","courses_id":"227","courseAverage":80.89,"maxFail":2},{"courses_dept":"civl","courses_id":"522","courseAverage":80.89,"maxFail":4},{"courses_dept":"eece","courses_id":"563","courseAverage":80.9,"maxFail":0},{"courses_dept":"phar","courses_id":"456","courseAverage":80.9,"maxFail":0},{"courses_dept":"biol","courses_id":"445","courseAverage":80.9,"maxFail":1},{"courses_dept":"nurs","courses_id":"337","courseAverage":80.91,"maxFail":1},{"courses_dept":"scan","courses_id":"336","courseAverage":80.92,"maxFail":1},{"courses_dept":"dent","courses_id":"532","courseAverage":80.93,"maxFail":0},{"courses_dept":"bmeg","courses_id":"456","courseAverage":80.93,"maxFail":1},{"courses_dept":"eosc","courses_id":"212","courseAverage":80.93,"maxFail":1},{"courses_dept":"larc","courses_id":"532","courseAverage":80.95,"maxFail":0},{"courses_dept":"civl","courses_id":"440","courseAverage":80.95,"maxFail":2},{"courses_dept":"bams","courses_id":"523","courseAverage":80.96,"maxFail":0},{"courses_dept":"fre","courses_id":"585","courseAverage":80.96,"maxFail":0},{"courses_dept":"bama","courses_id":"514","courseAverage":80.97,"maxFail":0},{"courses_dept":"law","courses_id":"565","courseAverage":81,"maxFail":0},{"courses_dept":"span","courses_id":"495","courseAverage":81,"maxFail":0},{"courses_dept":"econ","courses_id":"562","courseAverage":81.01,"maxFail":1},{"courses_dept":"fnh","courses_id":"490","courseAverage":81.01,"maxFail":2},{"courses_dept":"cpsc","courses_id":"515","courseAverage":81.02,"maxFail":0},{"courses_dept":"grsj","courses_id":"310","courseAverage":81.02,"maxFail":0},{"courses_dept":"comm","courses_id":"464","courseAverage":81.02,"maxFail":1},{"courses_dept":"engl","courses_id":"489","courseAverage":81.02,"maxFail":1},{"courses_dept":"econ","courses_id":"502","courseAverage":81.02,"maxFail":2},{"courses_dept":"fnh","courses_id":"440","courseAverage":81.03,"maxFail":0},{"courses_dept":"spha","courses_id":"557","courseAverage":81.03,"maxFail":0},{"courses_dept":"nurs","courses_id":"303","courseAverage":81.03,"maxFail":1},{"courses_dept":"arch","courses_id":"500","courseAverage":81.05,"maxFail":0},{"courses_dept":"atsc","courses_id":"212","courseAverage":81.06,"maxFail":0},{"courses_dept":"biol","courses_id":"420","courseAverage":81.06,"maxFail":0},{"courses_dept":"chbe","courses_id":"485","courseAverage":81.06,"maxFail":0},{"courses_dept":"apbi","courses_id":"498","courseAverage":81.07,"maxFail":1},{"courses_dept":"mech","courses_id":"423","courseAverage":81.07,"maxFail":1},{"courses_dept":"dent","courses_id":"570","courseAverage":81.08,"maxFail":0},{"courses_dept":"bafi","courses_id":"511","courseAverage":81.08,"maxFail":1},{"courses_dept":"civl","courses_id":"564","courseAverage":81.09,"maxFail":0},{"courses_dept":"ends","courses_id":"401","courseAverage":81.09,"maxFail":0},{"courses_dept":"cens","courses_id":"404","courseAverage":81.1,"maxFail":0},{"courses_dept":"larc","courses_id":"440","courseAverage":81.1,"maxFail":0},{"courses_dept":"envr","courses_id":"410","courseAverage":81.11,"maxFail":2},{"courses_dept":"ling","courses_id":"452","courseAverage":81.11,"maxFail":2},{"courses_dept":"civl","courses_id":"436","courseAverage":81.11,"maxFail":4},{"courses_dept":"asia","courses_id":"376","courseAverage":81.12,"maxFail":1},{"courses_dept":"scan","courses_id":"333","courseAverage":81.13,"maxFail":1},{"courses_dept":"plan","courses_id":"425","courseAverage":81.13,"maxFail":2},{"courses_dept":"spph","courses_id":"544","courseAverage":81.14,"maxFail":0},{"courses_dept":"bahr","courses_id":"550","courseAverage":81.14,"maxFail":1},{"courses_dept":"soil","courses_id":"515","courseAverage":81.15,"maxFail":0},{"courses_dept":"bafi","courses_id":"500","courseAverage":81.16,"maxFail":2},{"courses_dept":"fipr","courses_id":"434","courseAverage":81.18,"maxFail":0},{"courses_dept":"pols","courses_id":"300","courseAverage":81.18,"maxFail":0},{"courses_dept":"pcth","courses_id":"325","courseAverage":81.19,"maxFail":1},{"courses_dept":"astu","courses_id":"210","courseAverage":81.21,"maxFail":0},{"courses_dept":"ba","courses_id":"513","courseAverage":81.21,"maxFail":0},{"courses_dept":"bioc","courses_id":"421","courseAverage":81.21,"maxFail":0},{"courses_dept":"comm","courses_id":"487","courseAverage":81.21,"maxFail":0},{"courses_dept":"phar","courses_id":"441","courseAverage":81.21,"maxFail":0},{"courses_dept":"civl","courses_id":"524","courseAverage":81.22,"maxFail":2},{"courses_dept":"mine","courses_id":"485","courseAverage":81.23,"maxFail":0},{"courses_dept":"econ","courses_id":"601","courseAverage":81.23,"maxFail":1},{"courses_dept":"biol","courses_id":"301","courseAverage":81.24,"maxFail":1},{"courses_dept":"biol","courses_id":"465","courseAverage":81.25,"maxFail":0},{"courses_dept":"larc","courses_id":"540","courseAverage":81.25,"maxFail":0},{"courses_dept":"geog","courses_id":"424","courseAverage":81.25,"maxFail":1},{"courses_dept":"phar","courses_id":"430","courseAverage":81.26,"maxFail":0},{"courses_dept":"arst","courses_id":"565","courseAverage":81.27,"maxFail":0},{"courses_dept":"civl","courses_id":"418","courseAverage":81.27,"maxFail":2},{"courses_dept":"arch","courses_id":"531","courseAverage":81.28,"maxFail":0},{"courses_dept":"bapa","courses_id":"550","courseAverage":81.28,"maxFail":0},{"courses_dept":"dent","courses_id":"527","courseAverage":81.28,"maxFail":0},{"courses_dept":"hist","courses_id":"433","courseAverage":81.29,"maxFail":0},{"courses_dept":"soil","courses_id":"518","courseAverage":81.29,"maxFail":0},{"courses_dept":"ital","courses_id":"430","courseAverage":81.3,"maxFail":1},{"courses_dept":"chbe","courses_id":"365","courseAverage":81.34,"maxFail":0},{"courses_dept":"fist","courses_id":"300","courseAverage":81.34,"maxFail":2},{"courses_dept":"arst","courses_id":"587","courseAverage":81.35,"maxFail":0},{"courses_dept":"baen","courses_id":"550","courseAverage":81.35,"maxFail":0},{"courses_dept":"basm","courses_id":"550","courseAverage":81.35,"maxFail":0},{"courses_dept":"germ","courses_id":"380","courseAverage":81.36,"maxFail":0},{"courses_dept":"bioc","courses_id":"404","courseAverage":81.38,"maxFail":0},{"courses_dept":"econ","courses_id":"550","courseAverage":81.38,"maxFail":0},{"courses_dept":"phar","courses_id":"440","courseAverage":81.38,"maxFail":0},{"courses_dept":"biol","courses_id":"509","courseAverage":81.39,"maxFail":1},{"courses_dept":"chbe","courses_id":"362","courseAverage":81.39,"maxFail":1},{"courses_dept":"lled","courses_id":"391","courseAverage":81.39,"maxFail":1},{"courses_dept":"cohr","courses_id":"301","courseAverage":81.4,"maxFail":0},{"courses_dept":"phar","courses_id":"526","courseAverage":81.4,"maxFail":0},{"courses_dept":"kin","courses_id":"383","courseAverage":81.42,"maxFail":1},{"courses_dept":"fnh","courses_id":"415","courseAverage":81.44,"maxFail":0},{"courses_dept":"kin","courses_id":"365","courseAverage":81.44,"maxFail":0},{"courses_dept":"arch","courses_id":"549","courseAverage":81.45,"maxFail":0},{"courses_dept":"chbe","courses_id":"376","courseAverage":81.45,"maxFail":3},{"courses_dept":"thtr","courses_id":"271","courseAverage":81.47,"maxFail":0},{"courses_dept":"thtr","courses_id":"273","courseAverage":81.47,"maxFail":0},{"courses_dept":"arch","courses_id":"512","courseAverage":81.48,"maxFail":3},{"courses_dept":"ba","courses_id":"507","courseAverage":81.49,"maxFail":1},{"courses_dept":"phar","courses_id":"371","courseAverage":81.49,"maxFail":1},{"courses_dept":"dent","courses_id":"513","courseAverage":81.5,"maxFail":0},{"courses_dept":"econ","courses_id":"307","courseAverage":81.5,"maxFail":0},{"courses_dept":"isci","courses_id":"320","courseAverage":81.5,"maxFail":0},{"courses_dept":"law","courses_id":"563","courseAverage":81.5,"maxFail":0},{"courses_dept":"cpsc","courses_id":"513","courseAverage":81.5,"maxFail":1},{"courses_dept":"eosc","courses_id":"514","courseAverage":81.5,"maxFail":1},{"courses_dept":"arch","courses_id":"517","courseAverage":81.52,"maxFail":0},{"courses_dept":"nurs","courses_id":"422","courseAverage":81.52,"maxFail":0},{"courses_dept":"comm","courses_id":"389","courseAverage":81.53,"maxFail":0},{"courses_dept":"grsj","courses_id":"422","courseAverage":81.53,"maxFail":0},{"courses_dept":"micb","courses_id":"421","courseAverage":81.53,"maxFail":0},{"courses_dept":"eece","courses_id":"565","courseAverage":81.53,"maxFail":1},{"courses_dept":"econ","courses_id":"425","courseAverage":81.55,"maxFail":1},{"courses_dept":"civl","courses_id":"562","courseAverage":81.56,"maxFail":0},{"courses_dept":"visa","courses_id":"352","courseAverage":81.56,"maxFail":0},{"courses_dept":"econ","courses_id":"374","courseAverage":81.57,"maxFail":1},{"courses_dept":"ends","courses_id":"221","courseAverage":81.58,"maxFail":2},{"courses_dept":"babs","courses_id":"550","courseAverage":81.58,"maxFail":4},{"courses_dept":"baac","courses_id":"501","courseAverage":81.59,"maxFail":0},{"courses_dept":"phar","courses_id":"361","courseAverage":81.59,"maxFail":0},{"courses_dept":"basc","courses_id":"500","courseAverage":81.6,"maxFail":0},{"courses_dept":"eosc","courses_id":"535","courseAverage":81.6,"maxFail":0},{"courses_dept":"comm","courses_id":"388","courseAverage":81.6,"maxFail":1},{"courses_dept":"micb","courses_id":"325","courseAverage":81.6,"maxFail":4},{"courses_dept":"cpsc","courses_id":"445","courseAverage":81.61,"maxFail":1},{"courses_dept":"bahr","courses_id":"520","courseAverage":81.62,"maxFail":0},{"courses_dept":"russ","courses_id":"412","courseAverage":81.62,"maxFail":1},{"courses_dept":"larc","courses_id":"525","courseAverage":81.63,"maxFail":0},{"courses_dept":"biol","courses_id":"417","courseAverage":81.64,"maxFail":1},{"courses_dept":"mech","courses_id":"220","courseAverage":81.64,"maxFail":1},{"courses_dept":"cpsc","courses_id":"301","courseAverage":81.64,"maxFail":19},{"courses_dept":"astu","courses_id":"211","courseAverage":81.66,"maxFail":0},{"courses_dept":"swed","courses_id":"110","courseAverage":81.66,"maxFail":0},{"courses_dept":"envr","courses_id":"300","courseAverage":81.66,"maxFail":1},{"courses_dept":"food","courses_id":"521","courseAverage":81.67,"maxFail":0},{"courses_dept":"span","courses_id":"549","courseAverage":81.67,"maxFail":0},{"courses_dept":"bahr","courses_id":"505","courseAverage":81.67,"maxFail":1},{"courses_dept":"arch","courses_id":"520","courseAverage":81.69,"maxFail":0},{"courses_dept":"frst","courses_id":"430","courseAverage":81.69,"maxFail":0},{"courses_dept":"ba","courses_id":"560","courseAverage":81.7,"maxFail":0},{"courses_dept":"musc","courses_id":"122","courseAverage":81.7,"maxFail":1},{"courses_dept":"bams","courses_id":"504","courseAverage":81.71,"maxFail":0},{"courses_dept":"food","courses_id":"524","courseAverage":81.72,"maxFail":0},{"courses_dept":"punj","courses_id":"200","courseAverage":81.72,"maxFail":1},{"courses_dept":"phar","courses_id":"362","courseAverage":81.74,"maxFail":0},{"courses_dept":"eosc","courses_id":"579","courseAverage":81.75,"maxFail":0},{"courses_dept":"soil","courses_id":"501","courseAverage":81.75,"maxFail":0},{"courses_dept":"pers","courses_id":"300","courseAverage":81.75,"maxFail":1},{"courses_dept":"arch","courses_id":"533","courseAverage":81.76,"maxFail":0},{"courses_dept":"eosc","courses_id":"424","courseAverage":81.76,"maxFail":0},{"courses_dept":"nurs","courses_id":"502","courseAverage":81.76,"maxFail":0},{"courses_dept":"spph","courses_id":"400","courseAverage":81.76,"maxFail":2},{"courses_dept":"civl","courses_id":"570","courseAverage":81.77,"maxFail":0},{"courses_dept":"math","courses_id":"420","courseAverage":81.77,"maxFail":1},{"courses_dept":"swed","courses_id":"100","courseAverage":81.77,"maxFail":1},{"courses_dept":"arst","courses_id":"580","courseAverage":81.78,"maxFail":0},{"courses_dept":"civl","courses_id":"529","courseAverage":81.78,"maxFail":1},{"courses_dept":"pcth","courses_id":"201","courseAverage":81.78,"maxFail":1},{"courses_dept":"civl","courses_id":"478","courseAverage":81.79,"maxFail":0},{"courses_dept":"eced","courses_id":"441","courseAverage":81.79,"maxFail":1},{"courses_dept":"grek","courses_id":"101","courseAverage":81.79,"maxFail":1},{"courses_dept":"comm","courses_id":"474","courseAverage":81.8,"maxFail":0},{"courses_dept":"econ","courses_id":"306","courseAverage":81.8,"maxFail":0},{"courses_dept":"mech","courses_id":"386","courseAverage":81.8,"maxFail":1},{"courses_dept":"lfs","courses_id":"450","courseAverage":81.8,"maxFail":2},{"courses_dept":"astr","courses_id":"333","courseAverage":81.81,"maxFail":0},{"courses_dept":"bahr","courses_id":"507","courseAverage":81.81,"maxFail":0},{"courses_dept":"path","courses_id":"406","courseAverage":81.81,"maxFail":0},{"courses_dept":"mech","courses_id":"596","courseAverage":81.81,"maxFail":1},{"courses_dept":"cpsc","courses_id":"312","courseAverage":81.81,"maxFail":4},{"courses_dept":"mine","courses_id":"552","courseAverage":81.82,"maxFail":0},{"courses_dept":"mtrl","courses_id":"595","courseAverage":81.83,"maxFail":0},{"courses_dept":"lled","courses_id":"479","courseAverage":81.84,"maxFail":2},{"courses_dept":"apsc","courses_id":"541","courseAverage":81.86,"maxFail":0},{"courses_dept":"mtrl","courses_id":"557","courseAverage":81.87,"maxFail":1},{"courses_dept":"ba","courses_id":"564","courseAverage":81.89,"maxFail":0},{"courses_dept":"dani","courses_id":"110","courseAverage":81.89,"maxFail":0},{"courses_dept":"pers","courses_id":"100","courseAverage":81.89,"maxFail":2},{"courses_dept":"bams","courses_id":"506","courseAverage":81.9,"maxFail":0},{"courses_dept":"comm","courses_id":"387","courseAverage":81.9,"maxFail":0},{"courses_dept":"phar","courses_id":"506","courseAverage":81.9,"maxFail":0},{"courses_dept":"chem","courses_id":"402","courseAverage":81.92,"maxFail":1},{"courses_dept":"igen","courses_id":"230","courseAverage":81.93,"maxFail":0},{"courses_dept":"dent","courses_id":"420","courseAverage":81.94,"maxFail":0},{"courses_dept":"eece","courses_id":"513","courseAverage":81.94,"maxFail":0},{"courses_dept":"arch","courses_id":"411","courseAverage":81.94,"maxFail":1},{"courses_dept":"epse","courses_id":"348","courseAverage":81.94,"maxFail":1},{"courses_dept":"phar","courses_id":"448","courseAverage":81.95,"maxFail":0},{"courses_dept":"ba","courses_id":"563","courseAverage":81.97,"maxFail":0},{"courses_dept":"spha","courses_id":"501","courseAverage":81.97,"maxFail":1},{"courses_dept":"ba","courses_id":"561","courseAverage":81.97,"maxFail":3},{"courses_dept":"arch","courses_id":"568","courseAverage":81.98,"maxFail":0},{"courses_dept":"spha","courses_id":"555","courseAverage":81.98,"maxFail":1},{"courses_dept":"punj","courses_id":"102","courseAverage":81.98,"maxFail":2},{"courses_dept":"atsc","courses_id":"506","courseAverage":82,"maxFail":0},{"courses_dept":"bams","courses_id":"502","courseAverage":82,"maxFail":0},{"courses_dept":"civl","courses_id":"538","courseAverage":82,"maxFail":0},{"courses_dept":"mech","courses_id":"552","courseAverage":82,"maxFail":0},{"courses_dept":"mech","courses_id":"582","courseAverage":82,"maxFail":0},{"courses_dept":"econ","courses_id":"556","courseAverage":82.01,"maxFail":0},{"courses_dept":"chem","courses_id":"416","courseAverage":82.02,"maxFail":0},{"courses_dept":"mech","courses_id":"488","courseAverage":82.02,"maxFail":0},{"courses_dept":"atsc","courses_id":"406","courseAverage":82.02,"maxFail":1},{"courses_dept":"biol","courses_id":"440","courseAverage":82.02,"maxFail":1},{"courses_dept":"chbe","courses_id":"464","courseAverage":82.03,"maxFail":2},{"courses_dept":"japn","courses_id":"311","courseAverage":82.04,"maxFail":1},{"courses_dept":"isci","courses_id":"350","courseAverage":82.06,"maxFail":3},{"courses_dept":"baen","courses_id":"505","courseAverage":82.07,"maxFail":0},{"courses_dept":"fnh","courses_id":"340","courseAverage":82.07,"maxFail":0},{"courses_dept":"nurs","courses_id":"420","courseAverage":82.07,"maxFail":1},{"courses_dept":"arst","courses_id":"510","courseAverage":82.08,"maxFail":0},{"courses_dept":"chbe","courses_id":"564","courseAverage":82.08,"maxFail":0},{"courses_dept":"chem","courses_id":"569","courseAverage":82.08,"maxFail":0},{"courses_dept":"phys","courses_id":"349","courseAverage":82.09,"maxFail":0},{"courses_dept":"hist","courses_id":"485","courseAverage":82.09,"maxFail":2},{"courses_dept":"civl","courses_id":"202","courseAverage":82.1,"maxFail":1},{"courses_dept":"visa","courses_id":"370","courseAverage":82.11,"maxFail":1},{"courses_dept":"biol","courses_id":"459","courseAverage":82.12,"maxFail":0},{"courses_dept":"nurs","courses_id":"305","courseAverage":82.12,"maxFail":0},{"courses_dept":"punj","courses_id":"100","courseAverage":82.12,"maxFail":1},{"courses_dept":"mech","courses_id":"421","courseAverage":82.13,"maxFail":0},{"courses_dept":"econ","courses_id":"407","courseAverage":82.14,"maxFail":0},{"courses_dept":"phar","courses_id":"590","courseAverage":82.14,"maxFail":0},{"courses_dept":"libr","courses_id":"520","courseAverage":82.14,"maxFail":1},{"courses_dept":"arch","courses_id":"561","courseAverage":82.16,"maxFail":0},{"courses_dept":"span","courses_id":"222","courseAverage":82.16,"maxFail":0},{"courses_dept":"spph","courses_id":"521","courseAverage":82.17,"maxFail":0},{"courses_dept":"wood","courses_id":"244","courseAverage":82.17,"maxFail":1},{"courses_dept":"lfs","courses_id":"350","courseAverage":82.17,"maxFail":2},{"courses_dept":"larc","courses_id":"503","courseAverage":82.2,"maxFail":0},{"courses_dept":"path","courses_id":"375","courseAverage":82.2,"maxFail":0},{"courses_dept":"spph","courses_id":"511","courseAverage":82.21,"maxFail":0},{"courses_dept":"chbe","courses_id":"560","courseAverage":82.21,"maxFail":1},{"courses_dept":"astr","courses_id":"502","courseAverage":82.22,"maxFail":0},{"courses_dept":"ends","courses_id":"440","courseAverage":82.22,"maxFail":0},{"courses_dept":"math","courses_id":"414","courseAverage":82.22,"maxFail":0},{"courses_dept":"relg","courses_id":"317","courseAverage":82.22,"maxFail":0},{"courses_dept":"spph","courses_id":"522","courseAverage":82.22,"maxFail":0},{"courses_dept":"econ","courses_id":"557","courseAverage":82.23,"maxFail":0},{"courses_dept":"civl","courses_id":"565","courseAverage":82.24,"maxFail":0},{"courses_dept":"food","courses_id":"520","courseAverage":82.24,"maxFail":0},{"courses_dept":"cohr","courses_id":"305","courseAverage":82.25,"maxFail":0},{"courses_dept":"comm","courses_id":"408","courseAverage":82.26,"maxFail":0},{"courses_dept":"phar","courses_id":"330","courseAverage":82.26,"maxFail":0},{"courses_dept":"phys","courses_id":"534","courseAverage":82.26,"maxFail":0},{"courses_dept":"thtr","courses_id":"272","courseAverage":82.28,"maxFail":0},{"courses_dept":"thtr","courses_id":"274","courseAverage":82.28,"maxFail":0},{"courses_dept":"eosc","courses_id":"442","courseAverage":82.29,"maxFail":0},{"courses_dept":"chbe","courses_id":"366","courseAverage":82.29,"maxFail":2},{"courses_dept":"basc","courses_id":"524","courseAverage":82.3,"maxFail":0},{"courses_dept":"bama","courses_id":"513","courseAverage":82.3,"maxFail":1},{"courses_dept":"larc","courses_id":"504","courseAverage":82.31,"maxFail":0},{"courses_dept":"frst","courses_id":"556","courseAverage":82.32,"maxFail":0},{"courses_dept":"path","courses_id":"415","courseAverage":82.32,"maxFail":0},{"courses_dept":"poli","courses_id":"461","courseAverage":82.32,"maxFail":1},{"courses_dept":"thtr","courses_id":"130","courseAverage":82.32,"maxFail":1},{"courses_dept":"igen","courses_id":"340","courseAverage":82.33,"maxFail":0},{"courses_dept":"arth","courses_id":"480","courseAverage":82.33,"maxFail":1},{"courses_dept":"biol","courses_id":"427","courseAverage":82.34,"maxFail":0},{"courses_dept":"kin","courses_id":"469","courseAverage":82.34,"maxFail":1},{"courses_dept":"ba","courses_id":"562","courseAverage":82.35,"maxFail":0},{"courses_dept":"mech","courses_id":"328","courseAverage":82.35,"maxFail":1},{"courses_dept":"thtr","courses_id":"308","courseAverage":82.35,"maxFail":1},{"courses_dept":"bama","courses_id":"504","courseAverage":82.36,"maxFail":0},{"courses_dept":"nurs","courses_id":"333","courseAverage":82.36,"maxFail":0},{"courses_dept":"arch","courses_id":"501","courseAverage":82.37,"maxFail":0},{"courses_dept":"ling","courses_id":"431","courseAverage":82.39,"maxFail":0},{"courses_dept":"pers","courses_id":"200","courseAverage":82.4,"maxFail":0},{"courses_dept":"port","courses_id":"301","courseAverage":82.4,"maxFail":0},{"courses_dept":"rsot","courses_id":"527","courseAverage":82.42,"maxFail":0},{"courses_dept":"eosc","courses_id":"532","courseAverage":82.42,"maxFail":1},{"courses_dept":"basm","courses_id":"502","courseAverage":82.43,"maxFail":0},{"courses_dept":"germ","courses_id":"411","courseAverage":82.44,"maxFail":0},{"courses_dept":"medg","courses_id":"421","courseAverage":82.44,"maxFail":1},{"courses_dept":"pers","courses_id":"104","courseAverage":82.44,"maxFail":1},{"courses_dept":"arch","courses_id":"521","courseAverage":82.45,"maxFail":0},{"courses_dept":"fnh","courses_id":"403","courseAverage":82.49,"maxFail":0},{"courses_dept":"dent","courses_id":"566","courseAverage":82.5,"maxFail":0},{"courses_dept":"mrne","courses_id":"437","courseAverage":82.5,"maxFail":0},{"courses_dept":"dent","courses_id":"543","courseAverage":82.5,"maxFail":1},{"courses_dept":"phys","courses_id":"109","courseAverage":82.51,"maxFail":2},{"courses_dept":"anat","courses_id":"392","courseAverage":82.52,"maxFail":0},{"courses_dept":"libr","courses_id":"523","courseAverage":82.52,"maxFail":0},{"courses_dept":"spha","courses_id":"521","courseAverage":82.53,"maxFail":0},{"courses_dept":"lfs","courses_id":"400","courseAverage":82.53,"maxFail":1},{"courses_dept":"micb","courses_id":"447","courseAverage":82.53,"maxFail":1},{"courses_dept":"musc","courses_id":"336","courseAverage":82.53,"maxFail":1},{"courses_dept":"eece","courses_id":"564","courseAverage":82.53,"maxFail":2},{"courses_dept":"bait","courses_id":"527","courseAverage":82.55,"maxFail":0},{"courses_dept":"dhyg","courses_id":"210","courseAverage":82.55,"maxFail":0},{"courses_dept":"food","courses_id":"525","courseAverage":82.56,"maxFail":0},{"courses_dept":"spha","courses_id":"502","courseAverage":82.56,"maxFail":0},{"courses_dept":"spha","courses_id":"543","courseAverage":82.56,"maxFail":0},{"courses_dept":"edst","courses_id":"543","courseAverage":82.57,"maxFail":0},{"courses_dept":"hist","courses_id":"596","courseAverage":82.57,"maxFail":0},{"courses_dept":"libr","courses_id":"527","courseAverage":82.57,"maxFail":0},{"courses_dept":"kin","courses_id":"481","courseAverage":82.57,"maxFail":1},{"courses_dept":"hebr","courses_id":"101","courseAverage":82.58,"maxFail":1},{"courses_dept":"bams","courses_id":"508","courseAverage":82.59,"maxFail":0},{"courses_dept":"larc","courses_id":"316","courseAverage":82.59,"maxFail":1},{"courses_dept":"musc","courses_id":"320","courseAverage":82.61,"maxFail":2},{"courses_dept":"arch","courses_id":"543","courseAverage":82.62,"maxFail":0},{"courses_dept":"basm","courses_id":"501","courseAverage":82.62,"maxFail":0},{"courses_dept":"enph","courses_id":"459","courseAverage":82.62,"maxFail":0},{"courses_dept":"libr","courses_id":"505","courseAverage":82.62,"maxFail":1},{"courses_dept":"russ","courses_id":"101","courseAverage":82.62,"maxFail":2},{"courses_dept":"grsj","courses_id":"328","courseAverage":82.63,"maxFail":0},{"courses_dept":"eosc","courses_id":"270","courseAverage":82.64,"maxFail":3},{"courses_dept":"food","courses_id":"515","courseAverage":82.65,"maxFail":0},{"courses_dept":"spph","courses_id":"567","courseAverage":82.65,"maxFail":1},{"courses_dept":"arth","courses_id":"439","courseAverage":82.67,"maxFail":0},{"courses_dept":"musc","courses_id":"170","courseAverage":82.67,"maxFail":1},{"courses_dept":"edcp","courses_id":"530","courseAverage":82.68,"maxFail":0},{"courses_dept":"stat","courses_id":"460","courseAverage":82.68,"maxFail":2},{"courses_dept":"chbe","courses_id":"493","courseAverage":82.69,"maxFail":0},{"courses_dept":"chem","courses_id":"435","courseAverage":82.69,"maxFail":0},{"courses_dept":"germ","courses_id":"314","courseAverage":82.69,"maxFail":0},{"courses_dept":"apbi","courses_id":"490","courseAverage":82.7,"maxFail":2},{"courses_dept":"arst","courses_id":"560","courseAverage":82.71,"maxFail":0},{"courses_dept":"arch","courses_id":"539","courseAverage":82.72,"maxFail":0},{"courses_dept":"phys","courses_id":"500","courseAverage":82.73,"maxFail":1},{"courses_dept":"eosc","courses_id":"538","courseAverage":82.75,"maxFail":0},{"courses_dept":"mech","courses_id":"467","courseAverage":82.75,"maxFail":0},{"courses_dept":"mtrl","courses_id":"489","courseAverage":82.75,"maxFail":1},{"courses_dept":"fnh","courses_id":"474","courseAverage":82.76,"maxFail":0},{"courses_dept":"rsot","courses_id":"545","courseAverage":82.79,"maxFail":0},{"courses_dept":"apbi","courses_id":"414","courseAverage":82.8,"maxFail":0},{"courses_dept":"bama","courses_id":"515","courseAverage":82.8,"maxFail":0},{"courses_dept":"chbe","courses_id":"554","courseAverage":82.8,"maxFail":0},{"courses_dept":"law","courses_id":"549","courseAverage":82.8,"maxFail":0},{"courses_dept":"musc","courses_id":"465","courseAverage":82.8,"maxFail":1},{"courses_dept":"hgse","courses_id":"353","courseAverage":82.81,"maxFail":0},{"courses_dept":"larc","courses_id":"542","courseAverage":82.82,"maxFail":0},{"courses_dept":"phil","courses_id":"585","courseAverage":82.82,"maxFail":0},{"courses_dept":"obst","courses_id":"504","courseAverage":82.84,"maxFail":0},{"courses_dept":"lled","courses_id":"452","courseAverage":82.84,"maxFail":1},{"courses_dept":"arth","courses_id":"436","courseAverage":82.85,"maxFail":0},{"courses_dept":"geog","courses_id":"450","courseAverage":82.85,"maxFail":0},{"courses_dept":"spph","courses_id":"555","courseAverage":82.85,"maxFail":0},{"courses_dept":"phar","courses_id":"315","courseAverage":82.85,"maxFail":1},{"courses_dept":"hebr","courses_id":"201","courseAverage":82.86,"maxFail":0},{"courses_dept":"punj","courses_id":"300","courseAverage":82.86,"maxFail":0},{"courses_dept":"nurs","courses_id":"504","courseAverage":82.89,"maxFail":0},{"courses_dept":"phar","courses_id":"471","courseAverage":82.9,"maxFail":0},{"courses_dept":"phys","courses_id":"348","courseAverage":82.9,"maxFail":0},{"courses_dept":"baen","courses_id":"510","courseAverage":82.9,"maxFail":1},{"courses_dept":"arst","courses_id":"573","courseAverage":82.91,"maxFail":0},{"courses_dept":"bait","courses_id":"550","courseAverage":82.91,"maxFail":0},{"courses_dept":"libr","courses_id":"555","courseAverage":82.91,"maxFail":1},{"courses_dept":"phys","courses_id":"540","courseAverage":82.91,"maxFail":1},{"courses_dept":"bait","courses_id":"513","courseAverage":82.92,"maxFail":0},{"courses_dept":"baul","courses_id":"501","courseAverage":82.92,"maxFail":0},{"courses_dept":"larc","courses_id":"595","courseAverage":82.92,"maxFail":0},{"courses_dept":"math","courses_id":"440","courseAverage":82.92,"maxFail":1},{"courses_dept":"phar","courses_id":"442","courseAverage":82.93,"maxFail":0},{"courses_dept":"fipr","courses_id":"233","courseAverage":82.94,"maxFail":0},{"courses_dept":"mine","courses_id":"491","courseAverage":82.94,"maxFail":0},{"courses_dept":"mine","courses_id":"582","courseAverage":82.94,"maxFail":0},{"courses_dept":"musc","courses_id":"112","courseAverage":82.94,"maxFail":0},{"courses_dept":"nrsc","courses_id":"500","courseAverage":82.94,"maxFail":1},{"courses_dept":"econ","courses_id":"544","courseAverage":82.95,"maxFail":0},{"courses_dept":"adhe","courses_id":"327","courseAverage":82.98,"maxFail":4},{"courses_dept":"biol","courses_id":"344","courseAverage":82.99,"maxFail":0},{"courses_dept":"econ","courses_id":"527","courseAverage":82.99,"maxFail":2},{"courses_dept":"ital","courses_id":"402","courseAverage":83,"maxFail":0},{"courses_dept":"latn","courses_id":"351","courseAverage":83,"maxFail":0},{"courses_dept":"rmes","courses_id":"517","courseAverage":83,"maxFail":0},{"courses_dept":"bait","courses_id":"510","courseAverage":83.01,"maxFail":0},{"courses_dept":"econ","courses_id":"600","courseAverage":83.01,"maxFail":1},{"courses_dept":"phar","courses_id":"460","courseAverage":83.01,"maxFail":1},{"courses_dept":"spha","courses_id":"554","courseAverage":83.01,"maxFail":1},{"courses_dept":"econ","courses_id":"566","courseAverage":83.02,"maxFail":0},{"courses_dept":"germ","courses_id":"434","courseAverage":83.02,"maxFail":0},{"courses_dept":"mech","courses_id":"433","courseAverage":83.02,"maxFail":0},{"courses_dept":"path","courses_id":"408","courseAverage":83.02,"maxFail":0},{"courses_dept":"kin","courses_id":"585","courseAverage":83.05,"maxFail":0},{"courses_dept":"swed","courses_id":"210","courseAverage":83.05,"maxFail":0},{"courses_dept":"bama","courses_id":"508","courseAverage":83.06,"maxFail":0},{"courses_dept":"musc","courses_id":"235","courseAverage":83.06,"maxFail":0},{"courses_dept":"phys","courses_id":"516","courseAverage":83.06,"maxFail":0},{"courses_dept":"dani","courses_id":"200","courseAverage":83.07,"maxFail":0},{"courses_dept":"chbe","courses_id":"243","courseAverage":83.07,"maxFail":2},{"courses_dept":"scan","courses_id":"414","courseAverage":83.08,"maxFail":0},{"courses_dept":"spha","courses_id":"531","courseAverage":83.08,"maxFail":0},{"courses_dept":"spha","courses_id":"510","courseAverage":83.1,"maxFail":1},{"courses_dept":"comm","courses_id":"466","courseAverage":83.11,"maxFail":0},{"courses_dept":"medg","courses_id":"570","courseAverage":83.11,"maxFail":0},{"courses_dept":"spha","courses_id":"542","courseAverage":83.11,"maxFail":0},{"courses_dept":"edcp","courses_id":"492","courseAverage":83.11,"maxFail":1},{"courses_dept":"apsc","courses_id":"279","courseAverage":83.11,"maxFail":9},{"courses_dept":"basm","courses_id":"530","courseAverage":83.12,"maxFail":0},{"courses_dept":"frst","courses_id":"408","courseAverage":83.12,"maxFail":0},{"courses_dept":"mrne","courses_id":"480","courseAverage":83.12,"maxFail":0},{"courses_dept":"bafi","courses_id":"503","courseAverage":83.12,"maxFail":1},{"courses_dept":"obst","courses_id":"503","courseAverage":83.13,"maxFail":0},{"courses_dept":"frst","courses_id":"302","courseAverage":83.14,"maxFail":0},{"courses_dept":"larc","courses_id":"501","courseAverage":83.14,"maxFail":0},{"courses_dept":"path","courses_id":"405","courseAverage":83.14,"maxFail":0},{"courses_dept":"eosc","courses_id":"111","courseAverage":83.14,"maxFail":7},{"courses_dept":"civl","courses_id":"521","courseAverage":83.15,"maxFail":0},{"courses_dept":"grsj","courses_id":"230","courseAverage":83.15,"maxFail":0},{"courses_dept":"civl","courses_id":"523","courseAverage":83.16,"maxFail":1},{"courses_dept":"arch","courses_id":"540","courseAverage":83.2,"maxFail":0},{"courses_dept":"cons","courses_id":"451","courseAverage":83.2,"maxFail":0},{"courses_dept":"baen","courses_id":"506","courseAverage":83.21,"maxFail":0},{"courses_dept":"mech","courses_id":"484","courseAverage":83.21,"maxFail":1},{"courses_dept":"baen","courses_id":"502","courseAverage":83.22,"maxFail":0},{"courses_dept":"cpsc","courses_id":"502","courseAverage":83.22,"maxFail":0},{"courses_dept":"comm","courses_id":"634","courseAverage":83.23,"maxFail":0},{"courses_dept":"phys","courses_id":"229","courseAverage":83.23,"maxFail":0},{"courses_dept":"mech","courses_id":"493","courseAverage":83.25,"maxFail":0},{"courses_dept":"nurs","courses_id":"306","courseAverage":83.25,"maxFail":0},{"courses_dept":"nurs","courses_id":"334","courseAverage":83.26,"maxFail":0},{"courses_dept":"rhsc","courses_id":"503","courseAverage":83.26,"maxFail":1},{"courses_dept":"mech","courses_id":"458","courseAverage":83.27,"maxFail":0},{"courses_dept":"geog","courses_id":"495","courseAverage":83.28,"maxFail":0},{"courses_dept":"arch","courses_id":"548","courseAverage":83.31,"maxFail":1},{"courses_dept":"lled","courses_id":"459","courseAverage":83.31,"maxFail":1},{"courses_dept":"midw","courses_id":"110","courseAverage":83.32,"maxFail":0},{"courses_dept":"bioc","courses_id":"530","courseAverage":83.33,"maxFail":0},{"courses_dept":"eosc","courses_id":"573","courseAverage":83.33,"maxFail":0},{"courses_dept":"phth","courses_id":"531","courseAverage":83.33,"maxFail":0},{"courses_dept":"arst","courses_id":"516","courseAverage":83.34,"maxFail":0},{"courses_dept":"nurs","courses_id":"599","courseAverage":83.34,"maxFail":0},{"courses_dept":"bafi","courses_id":"502","courseAverage":83.35,"maxFail":0},{"courses_dept":"mech","courses_id":"226","courseAverage":83.36,"maxFail":0},{"courses_dept":"spha","courses_id":"553","courseAverage":83.38,"maxFail":0},{"courses_dept":"basm","courses_id":"531","courseAverage":83.39,"maxFail":0},{"courses_dept":"econ","courses_id":"541","courseAverage":83.39,"maxFail":0},{"courses_dept":"span","courses_id":"504","courseAverage":83.39,"maxFail":0},{"courses_dept":"hist","courses_id":"449","courseAverage":83.4,"maxFail":0},{"courses_dept":"mine","courses_id":"554","courseAverage":83.4,"maxFail":0},{"courses_dept":"rmes","courses_id":"501","courseAverage":83.41,"maxFail":0},{"courses_dept":"libr","courses_id":"521","courseAverage":83.42,"maxFail":0},{"courses_dept":"bota","courses_id":"526","courseAverage":83.43,"maxFail":0},{"courses_dept":"civl","courses_id":"526","courseAverage":83.44,"maxFail":0},{"courses_dept":"comm","courses_id":"311","courseAverage":83.44,"maxFail":1},{"courses_dept":"apbi","courses_id":"402","courseAverage":83.46,"maxFail":0},{"courses_dept":"econ","courses_id":"514","courseAverage":83.47,"maxFail":0},{"courses_dept":"engl","courses_id":"211","courseAverage":83.47,"maxFail":0},{"courses_dept":"phys","courses_id":"505","courseAverage":83.47,"maxFail":0},{"courses_dept":"spha","courses_id":"563","courseAverage":83.47,"maxFail":0},{"courses_dept":"dent","courses_id":"574","courseAverage":83.48,"maxFail":0},{"courses_dept":"civl","courses_id":"556","courseAverage":83.5,"maxFail":0},{"courses_dept":"dent","courses_id":"533","courseAverage":83.5,"maxFail":0},{"courses_dept":"bafi","courses_id":"532","courseAverage":83.5,"maxFail":1},{"courses_dept":"dhyg","courses_id":"433","courseAverage":83.52,"maxFail":1},{"courses_dept":"cons","courses_id":"101","courseAverage":83.52,"maxFail":6},{"courses_dept":"ling","courses_id":"405","courseAverage":83.53,"maxFail":0},{"courses_dept":"sowk","courses_id":"521","courseAverage":83.55,"maxFail":0},{"courses_dept":"mech","courses_id":"459","courseAverage":83.55,"maxFail":1},{"courses_dept":"math","courses_id":"425","courseAverage":83.56,"maxFail":1},{"courses_dept":"caps","courses_id":"303","courseAverage":83.57,"maxFail":0},{"courses_dept":"hebr","courses_id":"202","courseAverage":83.57,"maxFail":0},{"courses_dept":"musc","courses_id":"313","courseAverage":83.57,"maxFail":0},{"courses_dept":"frst","courses_id":"524","courseAverage":83.58,"maxFail":0},{"courses_dept":"math","courses_id":"444","courseAverage":83.58,"maxFail":0},{"courses_dept":"biol","courses_id":"450","courseAverage":83.59,"maxFail":0},{"courses_dept":"eece","courses_id":"528","courseAverage":83.59,"maxFail":0},{"courses_dept":"nurs","courses_id":"580","courseAverage":83.59,"maxFail":0},{"courses_dept":"atsc","courses_id":"201","courseAverage":83.59,"maxFail":2},{"courses_dept":"micb","courses_id":"407","courseAverage":83.6,"maxFail":0},{"courses_dept":"mrne","courses_id":"415","courseAverage":83.6,"maxFail":0},{"courses_dept":"nurs","courses_id":"302","courseAverage":83.6,"maxFail":1},{"courses_dept":"fist","courses_id":"445","courseAverage":83.61,"maxFail":0},{"courses_dept":"mech","courses_id":"545","courseAverage":83.61,"maxFail":0},{"courses_dept":"nurs","courses_id":"336","courseAverage":83.63,"maxFail":0},{"courses_dept":"arch","courses_id":"598","courseAverage":83.64,"maxFail":0},{"courses_dept":"libr","courses_id":"511","courseAverage":83.64,"maxFail":0},{"courses_dept":"bait","courses_id":"511","courseAverage":83.65,"maxFail":0},{"courses_dept":"econ","courses_id":"305","courseAverage":83.65,"maxFail":0},{"courses_dept":"musc","courses_id":"436","courseAverage":83.65,"maxFail":1},{"courses_dept":"arst","courses_id":"545","courseAverage":83.66,"maxFail":0},{"courses_dept":"nrsc","courses_id":"501","courseAverage":83.66,"maxFail":0},{"courses_dept":"eced","courses_id":"406","courseAverage":83.66,"maxFail":1},{"courses_dept":"ba","courses_id":"511","courseAverage":83.67,"maxFail":0},{"courses_dept":"biol","courses_id":"447","courseAverage":83.67,"maxFail":0},{"courses_dept":"mech","courses_id":"597","courseAverage":83.67,"maxFail":0},{"courses_dept":"sans","courses_id":"100","courseAverage":83.67,"maxFail":0},{"courses_dept":"kin","courses_id":"375","courseAverage":83.67,"maxFail":2},{"courses_dept":"apsc","courses_id":"486","courseAverage":83.68,"maxFail":0},{"courses_dept":"civl","courses_id":"201","courseAverage":83.68,"maxFail":0},{"courses_dept":"mech","courses_id":"457","courseAverage":83.68,"maxFail":0},{"courses_dept":"musc","courses_id":"529","courseAverage":83.69,"maxFail":1},{"courses_dept":"larc","courses_id":"531","courseAverage":83.71,"maxFail":0},{"courses_dept":"econ","courses_id":"457","courseAverage":83.73,"maxFail":0},{"courses_dept":"libe","courses_id":"465","courseAverage":83.73,"maxFail":0},{"courses_dept":"dent","courses_id":"572","courseAverage":83.75,"maxFail":0},{"courses_dept":"civl","courses_id":"518","courseAverage":83.76,"maxFail":0},{"courses_dept":"apbi","courses_id":"398","courseAverage":83.77,"maxFail":0},{"courses_dept":"thtr","courses_id":"373","courseAverage":83.77,"maxFail":0},{"courses_dept":"cpsc","courses_id":"527","courseAverage":83.78,"maxFail":0},{"courses_dept":"thtr","courses_id":"371","courseAverage":83.78,"maxFail":0},{"courses_dept":"musc","courses_id":"441","courseAverage":83.79,"maxFail":1},{"courses_dept":"arst","courses_id":"520","courseAverage":83.82,"maxFail":0},{"courses_dept":"mech","courses_id":"572","courseAverage":83.82,"maxFail":0},{"courses_dept":"econ","courses_id":"602","courseAverage":83.82,"maxFail":1},{"courses_dept":"dent","courses_id":"531","courseAverage":83.83,"maxFail":0},{"courses_dept":"math","courses_id":"423","courseAverage":83.84,"maxFail":0},{"courses_dept":"phth","courses_id":"521","courseAverage":83.84,"maxFail":0},{"courses_dept":"russ","courses_id":"400","courseAverage":83.84,"maxFail":0},{"courses_dept":"sowk","courses_id":"310","courseAverage":83.85,"maxFail":0},{"courses_dept":"chbe","courses_id":"483","courseAverage":83.86,"maxFail":0},{"courses_dept":"basm","courses_id":"523","courseAverage":83.87,"maxFail":0},{"courses_dept":"dani","courses_id":"210","courseAverage":83.89,"maxFail":0},{"courses_dept":"bafi","courses_id":"507","courseAverage":83.9,"maxFail":0},{"courses_dept":"chbe","courses_id":"364","courseAverage":83.91,"maxFail":0},{"courses_dept":"chbe","courses_id":"573","courseAverage":83.91,"maxFail":0},{"courses_dept":"frst","courses_id":"523","courseAverage":83.91,"maxFail":0},{"courses_dept":"mech","courses_id":"470","courseAverage":83.91,"maxFail":0},{"courses_dept":"pcth","courses_id":"302","courseAverage":83.91,"maxFail":0},{"courses_dept":"mech","courses_id":"589","courseAverage":83.91,"maxFail":1},{"courses_dept":"sowk","courses_id":"337","courseAverage":83.91,"maxFail":1},{"courses_dept":"econ","courses_id":"561","courseAverage":83.92,"maxFail":1},{"courses_dept":"nurs","courses_id":"554","courseAverage":83.93,"maxFail":0},{"courses_dept":"spha","courses_id":"552","courseAverage":83.93,"maxFail":0},{"courses_dept":"soil","courses_id":"516","courseAverage":83.94,"maxFail":0},{"courses_dept":"biol","courses_id":"431","courseAverage":83.95,"maxFail":0},{"courses_dept":"edst","courses_id":"541","courseAverage":83.95,"maxFail":0},{"courses_dept":"fre","courses_id":"515","courseAverage":83.95,"maxFail":0},{"courses_dept":"spph","courses_id":"535","courseAverage":83.95,"maxFail":0},{"courses_dept":"comm","courses_id":"672","courseAverage":83.95,"maxFail":1},{"courses_dept":"cpsc","courses_id":"500","courseAverage":83.95,"maxFail":1},{"courses_dept":"nurs","courses_id":"552","courseAverage":83.97,"maxFail":0},{"courses_dept":"phth","courses_id":"564","courseAverage":83.97,"maxFail":0},{"courses_dept":"audi","courses_id":"513","courseAverage":83.99,"maxFail":0},{"courses_dept":"bams","courses_id":"517","courseAverage":84,"maxFail":0},{"courses_dept":"dent","courses_id":"526","courseAverage":84,"maxFail":0},{"courses_dept":"dent","courses_id":"592","courseAverage":84,"maxFail":0},{"courses_dept":"edst","courses_id":"527","courseAverage":84,"maxFail":0},{"courses_dept":"eece","courses_id":"535","courseAverage":84,"maxFail":0},{"courses_dept":"audi","courses_id":"527","courseAverage":84.04,"maxFail":0},{"courses_dept":"chem","courses_id":"524","courseAverage":84.04,"maxFail":0},{"courses_dept":"arst","courses_id":"515","courseAverage":84.05,"maxFail":0},{"courses_dept":"spph","courses_id":"541","courseAverage":84.07,"maxFail":0},{"courses_dept":"enph","courses_id":"479","courseAverage":84.08,"maxFail":0},{"courses_dept":"fipr","courses_id":"433","courseAverage":84.08,"maxFail":0},{"courses_dept":"biol","courses_id":"411","courseAverage":84.11,"maxFail":0},{"courses_dept":"biol","courses_id":"454","courseAverage":84.11,"maxFail":0},{"courses_dept":"nurs","courses_id":"425","courseAverage":84.11,"maxFail":0},{"courses_dept":"apbi","courses_id":"410","courseAverage":84.13,"maxFail":0},{"courses_dept":"dent","courses_id":"721","courseAverage":84.13,"maxFail":0},{"courses_dept":"grsj","courses_id":"235","courseAverage":84.14,"maxFail":0},{"courses_dept":"thtr","courses_id":"445","courseAverage":84.14,"maxFail":0},{"courses_dept":"thtr","courses_id":"150","courseAverage":84.14,"maxFail":1},{"courses_dept":"sans","courses_id":"102","courseAverage":84.14,"maxFail":2},{"courses_dept":"cpsc","courses_id":"319","courseAverage":84.15,"maxFail":1},{"courses_dept":"larc","courses_id":"541","courseAverage":84.16,"maxFail":0},{"courses_dept":"civl","courses_id":"447","courseAverage":84.17,"maxFail":0},{"courses_dept":"eece","courses_id":"509","courseAverage":84.17,"maxFail":0},{"courses_dept":"math","courses_id":"419","courseAverage":84.17,"maxFail":0},{"courses_dept":"civl","courses_id":"493","courseAverage":84.17,"maxFail":1},{"courses_dept":"phth","courses_id":"517","courseAverage":84.18,"maxFail":0},{"courses_dept":"frst","courses_id":"498","courseAverage":84.19,"maxFail":0},{"courses_dept":"nurs","courses_id":"512","courseAverage":84.19,"maxFail":0},{"courses_dept":"epse","courses_id":"411","courseAverage":84.21,"maxFail":1},{"courses_dept":"comm","courses_id":"439","courseAverage":84.22,"maxFail":0},{"courses_dept":"chbe","courses_id":"454","courseAverage":84.23,"maxFail":0},{"courses_dept":"name","courses_id":"501","courseAverage":84.23,"maxFail":0},{"courses_dept":"sowk","courses_id":"531","courseAverage":84.23,"maxFail":0},{"courses_dept":"hist","courses_id":"561","courseAverage":84.24,"maxFail":0},{"courses_dept":"sowk","courses_id":"416","courseAverage":84.24,"maxFail":0},{"courses_dept":"cpsc","courses_id":"544","courseAverage":84.25,"maxFail":0},{"courses_dept":"dent","courses_id":"594","courseAverage":84.25,"maxFail":0},{"courses_dept":"frst","courses_id":"490","courseAverage":84.25,"maxFail":0},{"courses_dept":"phar","courses_id":"458","courseAverage":84.25,"maxFail":0},{"courses_dept":"arst","courses_id":"591","courseAverage":84.26,"maxFail":0},{"courses_dept":"comm","courses_id":"695","courseAverage":84.26,"maxFail":0},{"courses_dept":"russ","courses_id":"300","courseAverage":84.26,"maxFail":0},{"courses_dept":"mech","courses_id":"454","courseAverage":84.28,"maxFail":0},{"courses_dept":"medg","courses_id":"575","courseAverage":84.28,"maxFail":0},{"courses_dept":"mine","courses_id":"393","courseAverage":84.28,"maxFail":4},{"courses_dept":"grsj","courses_id":"307","courseAverage":84.29,"maxFail":0},{"courses_dept":"chbe","courses_id":"491","courseAverage":84.3,"maxFail":0},{"courses_dept":"hgse","courses_id":"358","courseAverage":84.31,"maxFail":0},{"courses_dept":"spha","courses_id":"522","courseAverage":84.31,"maxFail":0},{"courses_dept":"asia","courses_id":"348","courseAverage":84.31,"maxFail":1},{"courses_dept":"chbe","courses_id":"453","courseAverage":84.31,"maxFail":1},{"courses_dept":"chem","courses_id":"449","courseAverage":84.31,"maxFail":1},{"courses_dept":"comm","courses_id":"660","courseAverage":84.32,"maxFail":0},{"courses_dept":"eece","courses_id":"573","courseAverage":84.32,"maxFail":0},{"courses_dept":"comm","courses_id":"671","courseAverage":84.33,"maxFail":0},{"courses_dept":"mine","courses_id":"438","courseAverage":84.33,"maxFail":0},{"courses_dept":"mtrl","courses_id":"599","courseAverage":84.35,"maxFail":0},{"courses_dept":"cogs","courses_id":"402","courseAverage":84.37,"maxFail":0},{"courses_dept":"bams","courses_id":"521","courseAverage":84.38,"maxFail":0},{"courses_dept":"civl","courses_id":"432","courseAverage":84.38,"maxFail":0},{"courses_dept":"thtr","courses_id":"372","courseAverage":84.38,"maxFail":0},{"courses_dept":"thtr","courses_id":"374","courseAverage":84.38,"maxFail":0},{"courses_dept":"civl","courses_id":"540","courseAverage":84.39,"maxFail":0},{"courses_dept":"soci","courses_id":"502","courseAverage":84.39,"maxFail":1},{"courses_dept":"math","courses_id":"562","courseAverage":84.4,"maxFail":0},{"courses_dept":"thtr","courses_id":"407","courseAverage":84.41,"maxFail":0},{"courses_dept":"eced","courses_id":"421","courseAverage":84.41,"maxFail":1},{"courses_dept":"sowk","courses_id":"335","courseAverage":84.42,"maxFail":0},{"courses_dept":"bama","courses_id":"506","courseAverage":84.43,"maxFail":0},{"courses_dept":"bams","courses_id":"522","courseAverage":84.43,"maxFail":0},{"courses_dept":"grek","courses_id":"201","courseAverage":84.43,"maxFail":0},{"courses_dept":"medg","courses_id":"535","courseAverage":84.44,"maxFail":0},{"courses_dept":"geob","courses_id":"500","courseAverage":84.46,"maxFail":0},{"courses_dept":"hinu","courses_id":"102","courseAverage":84.46,"maxFail":0},{"courses_dept":"nurs","courses_id":"549","courseAverage":84.47,"maxFail":0},{"courses_dept":"phth","courses_id":"524","courseAverage":84.47,"maxFail":0},{"courses_dept":"sowk","courses_id":"503","courseAverage":84.47,"maxFail":0},{"courses_dept":"mech","courses_id":"510","courseAverage":84.47,"maxFail":2},{"courses_dept":"arst","courses_id":"550","courseAverage":84.48,"maxFail":0},{"courses_dept":"bafi","courses_id":"520","courseAverage":84.48,"maxFail":0},{"courses_dept":"mech","courses_id":"505","courseAverage":84.49,"maxFail":0},{"courses_dept":"thtr","courses_id":"317","courseAverage":84.49,"maxFail":0},{"courses_dept":"bams","courses_id":"500","courseAverage":84.51,"maxFail":1},{"courses_dept":"dhyg","courses_id":"402","courseAverage":84.51,"maxFail":2},{"courses_dept":"bioc","courses_id":"420","courseAverage":84.52,"maxFail":0},{"courses_dept":"chem","courses_id":"566","courseAverage":84.52,"maxFail":0},{"courses_dept":"bioc","courses_id":"460","courseAverage":84.53,"maxFail":0},{"courses_dept":"midw","courses_id":"221","courseAverage":84.53,"maxFail":0},{"courses_dept":"nurs","courses_id":"304","courseAverage":84.54,"maxFail":0},{"courses_dept":"caps","courses_id":"424","courseAverage":84.55,"maxFail":0},{"courses_dept":"eosc","courses_id":"454","courseAverage":84.57,"maxFail":1},{"courses_dept":"dent","courses_id":"591","courseAverage":84.58,"maxFail":0},{"courses_dept":"chem","courses_id":"527","courseAverage":84.59,"maxFail":0},{"courses_dept":"micb","courses_id":"425","courseAverage":84.59,"maxFail":0},{"courses_dept":"econ","courses_id":"626","courseAverage":84.59,"maxFail":1},{"courses_dept":"thtr","courses_id":"330","courseAverage":84.62,"maxFail":0},{"courses_dept":"biol","courses_id":"535","courseAverage":84.63,"maxFail":0},{"courses_dept":"frst","courses_id":"588","courseAverage":84.63,"maxFail":0},{"courses_dept":"geog","courses_id":"520","courseAverage":84.63,"maxFail":0},{"courses_dept":"midw","courses_id":"305","courseAverage":84.63,"maxFail":0},{"courses_dept":"cics","courses_id":"530","courseAverage":84.64,"maxFail":0},{"courses_dept":"dhyg","courses_id":"410","courseAverage":84.64,"maxFail":0},{"courses_dept":"nrsc","courses_id":"549","courseAverage":84.64,"maxFail":0},{"courses_dept":"civl","courses_id":"507","courseAverage":84.66,"maxFail":1},{"courses_dept":"epse","courses_id":"577","courseAverage":84.67,"maxFail":0},{"courses_dept":"mtrl","courses_id":"582","courseAverage":84.67,"maxFail":0},{"courses_dept":"bmeg","courses_id":"550","courseAverage":84.68,"maxFail":0},{"courses_dept":"libr","courses_id":"512","courseAverage":84.68,"maxFail":0},{"courses_dept":"spha","courses_id":"556","courseAverage":84.68,"maxFail":0},{"courses_dept":"grsj","courses_id":"320","courseAverage":84.7,"maxFail":0},{"courses_dept":"libr","courses_id":"581","courseAverage":84.7,"maxFail":0},{"courses_dept":"libr","courses_id":"551","courseAverage":84.7,"maxFail":1},{"courses_dept":"eced","courses_id":"440","courseAverage":84.71,"maxFail":1},{"courses_dept":"caps","courses_id":"426","courseAverage":84.72,"maxFail":1},{"courses_dept":"fish","courses_id":"504","courseAverage":84.73,"maxFail":0},{"courses_dept":"larc","courses_id":"431","courseAverage":84.73,"maxFail":0},{"courses_dept":"bafi","courses_id":"541","courseAverage":84.74,"maxFail":1},{"courses_dept":"comm","courses_id":"662","courseAverage":84.75,"maxFail":0},{"courses_dept":"fnh","courses_id":"499","courseAverage":84.75,"maxFail":0},{"courses_dept":"medi","courses_id":"590","courseAverage":84.75,"maxFail":0},{"courses_dept":"path","courses_id":"501","courseAverage":84.75,"maxFail":0},{"courses_dept":"spph","courses_id":"536","courseAverage":84.75,"maxFail":1},{"courses_dept":"phth","courses_id":"565","courseAverage":84.76,"maxFail":0},{"courses_dept":"spph","courses_id":"500","courseAverage":84.76,"maxFail":1},{"courses_dept":"audi","courses_id":"569","courseAverage":84.77,"maxFail":0},{"courses_dept":"ling","courses_id":"510","courseAverage":84.81,"maxFail":0},{"courses_dept":"phys","courses_id":"541","courseAverage":84.81,"maxFail":0},{"courses_dept":"poli","courses_id":"390","courseAverage":84.82,"maxFail":0},{"courses_dept":"comm","courses_id":"693","courseAverage":84.84,"maxFail":0},{"courses_dept":"edcp","courses_id":"303","courseAverage":84.85,"maxFail":1},{"courses_dept":"cpsc","courses_id":"521","courseAverage":84.86,"maxFail":0},{"courses_dept":"mtrl","courses_id":"579","courseAverage":84.88,"maxFail":0},{"courses_dept":"nurs","courses_id":"505","courseAverage":84.88,"maxFail":0},{"courses_dept":"spph","courses_id":"504","courseAverage":84.89,"maxFail":0},{"courses_dept":"fnh","courses_id":"470","courseAverage":84.89,"maxFail":1},{"courses_dept":"eece","courses_id":"518","courseAverage":84.9,"maxFail":0},{"courses_dept":"kin","courses_id":"343","courseAverage":84.9,"maxFail":0},{"courses_dept":"sowk","courses_id":"305","courseAverage":84.9,"maxFail":0},{"courses_dept":"lled","courses_id":"441","courseAverage":84.9,"maxFail":2},{"courses_dept":"spph","courses_id":"502","courseAverage":84.91,"maxFail":1},{"courses_dept":"chem","courses_id":"529","courseAverage":84.92,"maxFail":0},{"courses_dept":"civl","courses_id":"586","courseAverage":84.92,"maxFail":0},{"courses_dept":"fipr","courses_id":"339","courseAverage":84.92,"maxFail":0},{"courses_dept":"germ","courses_id":"313","courseAverage":84.92,"maxFail":0},{"courses_dept":"libe","courses_id":"467","courseAverage":84.92,"maxFail":0},{"courses_dept":"phys","courses_id":"543","courseAverage":84.92,"maxFail":0},{"courses_dept":"dent","courses_id":"540","courseAverage":84.92,"maxFail":1},{"courses_dept":"hist","courses_id":"599","courseAverage":84.93,"maxFail":0},{"courses_dept":"mech","courses_id":"536","courseAverage":84.93,"maxFail":0},{"courses_dept":"bmeg","courses_id":"556","courseAverage":84.93,"maxFail":1},{"courses_dept":"phys","courses_id":"539","courseAverage":84.94,"maxFail":0},{"courses_dept":"fre","courses_id":"547","courseAverage":84.95,"maxFail":0},{"courses_dept":"rhsc","courses_id":"587","courseAverage":84.95,"maxFail":2},{"courses_dept":"spph","courses_id":"525","courseAverage":84.96,"maxFail":1},{"courses_dept":"isci","courses_id":"360","courseAverage":84.97,"maxFail":0},{"courses_dept":"kin","courses_id":"465","courseAverage":84.97,"maxFail":0},{"courses_dept":"kin","courses_id":"586","courseAverage":84.97,"maxFail":0},{"courses_dept":"micb","courses_id":"408","courseAverage":84.97,"maxFail":0},{"courses_dept":"edst","courses_id":"544","courseAverage":84.99,"maxFail":0},{"courses_dept":"chem","courses_id":"502","courseAverage":85,"maxFail":0},{"courses_dept":"civl","courses_id":"509","courseAverage":85,"maxFail":0},{"courses_dept":"cnrs","courses_id":"449","courseAverage":85,"maxFail":0},{"courses_dept":"dent","courses_id":"516","courseAverage":85,"maxFail":0},{"courses_dept":"caps","courses_id":"421","courseAverage":85,"maxFail":1},{"courses_dept":"eosc","courses_id":"453","courseAverage":85.02,"maxFail":0},{"courses_dept":"rsot","courses_id":"553","courseAverage":85.02,"maxFail":0},{"courses_dept":"poli","courses_id":"492","courseAverage":85.03,"maxFail":0},{"courses_dept":"sowk","courses_id":"400","courseAverage":85.03,"maxFail":0},{"courses_dept":"thtr","courses_id":"410","courseAverage":85.04,"maxFail":2},{"courses_dept":"sowk","courses_id":"502","courseAverage":85.06,"maxFail":0},{"courses_dept":"eece","courses_id":"560","courseAverage":85.06,"maxFail":1},{"courses_dept":"rsot","courses_id":"513","courseAverage":85.07,"maxFail":0},{"courses_dept":"dent","courses_id":"525","courseAverage":85.08,"maxFail":0},{"courses_dept":"phys","courses_id":"504","courseAverage":85.08,"maxFail":0},{"courses_dept":"spha","courses_id":"551","courseAverage":85.08,"maxFail":0},{"courses_dept":"eosc","courses_id":"542","courseAverage":85.08,"maxFail":1},{"courses_dept":"econ","courses_id":"573","courseAverage":85.09,"maxFail":0},{"courses_dept":"eosc","courses_id":"543","courseAverage":85.1,"maxFail":0},{"courses_dept":"sowk","courses_id":"654","courseAverage":85.1,"maxFail":0},{"courses_dept":"rhsc","courses_id":"501","courseAverage":85.1,"maxFail":2},{"courses_dept":"frst","courses_id":"558","courseAverage":85.11,"maxFail":0},{"courses_dept":"envr","courses_id":"400","courseAverage":85.13,"maxFail":0},{"courses_dept":"phar","courses_id":"462","courseAverage":85.14,"maxFail":0},{"courses_dept":"babs","courses_id":"502","courseAverage":85.16,"maxFail":0},{"courses_dept":"cnps","courses_id":"433","courseAverage":85.16,"maxFail":3},{"courses_dept":"sowk","courses_id":"320","courseAverage":85.17,"maxFail":1},{"courses_dept":"mine","courses_id":"350","courseAverage":85.18,"maxFail":1},{"courses_dept":"path","courses_id":"407","courseAverage":85.19,"maxFail":0},{"courses_dept":"soci","courses_id":"514","courseAverage":85.19,"maxFail":0},{"courses_dept":"sowk","courses_id":"571","courseAverage":85.19,"maxFail":0},{"courses_dept":"civl","courses_id":"441","courseAverage":85.19,"maxFail":1},{"courses_dept":"biol","courses_id":"501","courseAverage":85.2,"maxFail":0},{"courses_dept":"eece","courses_id":"544","courseAverage":85.2,"maxFail":0},{"courses_dept":"frst","courses_id":"590","courseAverage":85.2,"maxFail":0},{"courses_dept":"jrnl","courses_id":"533","courseAverage":85.2,"maxFail":1},{"courses_dept":"sowk","courses_id":"425","courseAverage":85.22,"maxFail":0},{"courses_dept":"civl","courses_id":"583","courseAverage":85.23,"maxFail":0},{"courses_dept":"phar","courses_id":"508","courseAverage":85.23,"maxFail":0},{"courses_dept":"cnrs","courses_id":"500","courseAverage":85.25,"maxFail":0},{"courses_dept":"phar","courses_id":"525","courseAverage":85.25,"maxFail":0},{"courses_dept":"phar","courses_id":"543","courseAverage":85.25,"maxFail":0},{"courses_dept":"sowk","courses_id":"450","courseAverage":85.25,"maxFail":0},{"courses_dept":"udes","courses_id":"501","courseAverage":85.25,"maxFail":0},{"courses_dept":"mech","courses_id":"502","courseAverage":85.26,"maxFail":0},{"courses_dept":"midw","courses_id":"405","courseAverage":85.26,"maxFail":0},{"courses_dept":"spph","courses_id":"563","courseAverage":85.26,"maxFail":0},{"courses_dept":"chem","courses_id":"563","courseAverage":85.27,"maxFail":0},{"courses_dept":"econ","courses_id":"565","courseAverage":85.27,"maxFail":1},{"courses_dept":"ital","courses_id":"401","courseAverage":85.28,"maxFail":0},{"courses_dept":"rsot","courses_id":"525","courseAverage":85.28,"maxFail":0},{"courses_dept":"arst","courses_id":"554","courseAverage":85.29,"maxFail":0},{"courses_dept":"fnh","courses_id":"425","courseAverage":85.29,"maxFail":0},{"courses_dept":"audi","courses_id":"556","courseAverage":85.3,"maxFail":0},{"courses_dept":"ceen","courses_id":"523","courseAverage":85.3,"maxFail":0},{"courses_dept":"igen","courses_id":"430","courseAverage":85.3,"maxFail":0},{"courses_dept":"cnps","courses_id":"364","courseAverage":85.3,"maxFail":4},{"courses_dept":"eosc","courses_id":"534","courseAverage":85.31,"maxFail":0},{"courses_dept":"spph","courses_id":"512","courseAverage":85.31,"maxFail":0},{"courses_dept":"spph","courses_id":"542","courseAverage":85.31,"maxFail":0},{"courses_dept":"edst","courses_id":"515","courseAverage":85.32,"maxFail":0},{"courses_dept":"russ","courses_id":"102","courseAverage":85.32,"maxFail":0},{"courses_dept":"civl","courses_id":"505","courseAverage":85.33,"maxFail":0},{"courses_dept":"arst","courses_id":"555","courseAverage":85.34,"maxFail":0},{"courses_dept":"libr","courses_id":"528","courseAverage":85.35,"maxFail":0},{"courses_dept":"phth","courses_id":"514","courseAverage":85.35,"maxFail":0},{"courses_dept":"chbe","courses_id":"452","courseAverage":85.36,"maxFail":0},{"courses_dept":"eosc","courses_id":"540","courseAverage":85.36,"maxFail":0},{"courses_dept":"frst","courses_id":"309","courseAverage":85.36,"maxFail":0},{"courses_dept":"mrne","courses_id":"425","courseAverage":85.36,"maxFail":0},{"courses_dept":"civl","courses_id":"304","courseAverage":85.38,"maxFail":0},{"courses_dept":"food","courses_id":"529","courseAverage":85.39,"maxFail":0},{"courses_dept":"ling","courses_id":"333","courseAverage":85.39,"maxFail":0},{"courses_dept":"musc","courses_id":"149","courseAverage":85.39,"maxFail":0},{"courses_dept":"phar","courses_id":"321","courseAverage":85.39,"maxFail":0},{"courses_dept":"phar","courses_id":"461","courseAverage":85.39,"maxFail":0},{"courses_dept":"eece","courses_id":"576","courseAverage":85.4,"maxFail":0},{"courses_dept":"frst","courses_id":"576","courseAverage":85.4,"maxFail":0},{"courses_dept":"spph","courses_id":"530","courseAverage":85.41,"maxFail":0},{"courses_dept":"mine","courses_id":"404","courseAverage":85.42,"maxFail":0},{"courses_dept":"psyc","courses_id":"359","courseAverage":85.42,"maxFail":0},{"courses_dept":"dent","courses_id":"599","courseAverage":85.43,"maxFail":0},{"courses_dept":"eced","courses_id":"416","courseAverage":85.43,"maxFail":1},{"courses_dept":"edcp","courses_id":"304","courseAverage":85.44,"maxFail":0},{"courses_dept":"eosc","courses_id":"511","courseAverage":85.44,"maxFail":0},{"courses_dept":"rhsc","courses_id":"420","courseAverage":85.44,"maxFail":0},{"courses_dept":"engl","courses_id":"210","courseAverage":85.45,"maxFail":0},{"courses_dept":"phar","courses_id":"501","courseAverage":85.45,"maxFail":0},{"courses_dept":"edst","courses_id":"509","courseAverage":85.46,"maxFail":0},{"courses_dept":"ling","courses_id":"531","courseAverage":85.46,"maxFail":0},{"courses_dept":"micb","courses_id":"404","courseAverage":85.46,"maxFail":0},{"courses_dept":"fipr","courses_id":"333","courseAverage":85.46,"maxFail":1},{"courses_dept":"mech","courses_id":"522","courseAverage":85.47,"maxFail":0},{"courses_dept":"rhsc","courses_id":"507","courseAverage":85.48,"maxFail":1},{"courses_dept":"thtr","courses_id":"520","courseAverage":85.5,"maxFail":0},{"courses_dept":"rmes","courses_id":"505","courseAverage":85.51,"maxFail":0},{"courses_dept":"spph","courses_id":"503","courseAverage":85.51,"maxFail":0},{"courses_dept":"edst","courses_id":"571","courseAverage":85.51,"maxFail":1},{"courses_dept":"rsot","courses_id":"549","courseAverage":85.52,"maxFail":0},{"courses_dept":"libr","courses_id":"557","courseAverage":85.53,"maxFail":0},{"courses_dept":"path","courses_id":"467","courseAverage":85.53,"maxFail":0},{"courses_dept":"sowk","courses_id":"570","courseAverage":85.54,"maxFail":0},{"courses_dept":"bioc","courses_id":"514","courseAverage":85.54,"maxFail":1},{"courses_dept":"biol","courses_id":"347","courseAverage":85.55,"maxFail":0},{"courses_dept":"chbe","courses_id":"561","courseAverage":85.55,"maxFail":0},{"courses_dept":"musc","courses_id":"312","courseAverage":85.56,"maxFail":0},{"courses_dept":"cell","courses_id":"508","courseAverage":85.57,"maxFail":0},{"courses_dept":"civl","courses_id":"516","courseAverage":85.57,"maxFail":0},{"courses_dept":"frst","courses_id":"530","courseAverage":85.58,"maxFail":0},{"courses_dept":"dent","courses_id":"565","courseAverage":85.59,"maxFail":0},{"courses_dept":"midw","courses_id":"205","courseAverage":85.61,"maxFail":0},{"courses_dept":"mech","courses_id":"514","courseAverage":85.61,"maxFail":1},{"courses_dept":"libr","courses_id":"516","courseAverage":85.62,"maxFail":0},{"courses_dept":"apbi","courses_id":"314","courseAverage":85.63,"maxFail":0},{"courses_dept":"eosc","courses_id":"598","courseAverage":85.64,"maxFail":0},{"courses_dept":"chbe","courses_id":"492","courseAverage":85.65,"maxFail":0},{"courses_dept":"phth","courses_id":"548","courseAverage":85.66,"maxFail":0},{"courses_dept":"spph","courses_id":"505","courseAverage":85.66,"maxFail":0},{"courses_dept":"name","courses_id":"591","courseAverage":85.67,"maxFail":0},{"courses_dept":"rmes","courses_id":"530","courseAverage":85.67,"maxFail":0},{"courses_dept":"stat","courses_id":"561","courseAverage":85.67,"maxFail":0},{"courses_dept":"eosc","courses_id":"536","courseAverage":85.68,"maxFail":0},{"courses_dept":"pcth","courses_id":"400","courseAverage":85.68,"maxFail":0},{"courses_dept":"soci","courses_id":"503","courseAverage":85.68,"maxFail":0},{"courses_dept":"anth","courses_id":"541","courseAverage":85.69,"maxFail":0},{"courses_dept":"math","courses_id":"507","courseAverage":85.69,"maxFail":0},{"courses_dept":"larc","courses_id":"551","courseAverage":85.7,"maxFail":0},{"courses_dept":"phar","courses_id":"515","courseAverage":85.71,"maxFail":0},{"courses_dept":"audi","courses_id":"571","courseAverage":85.72,"maxFail":0},{"courses_dept":"cpsc","courses_id":"509","courseAverage":85.72,"maxFail":0},{"courses_dept":"civl","courses_id":"511","courseAverage":85.74,"maxFail":0},{"courses_dept":"arst","courses_id":"600","courseAverage":85.75,"maxFail":0},{"courses_dept":"biol","courses_id":"437","courseAverage":85.75,"maxFail":0},{"courses_dept":"bmeg","courses_id":"500","courseAverage":85.75,"maxFail":0},{"courses_dept":"cpsc","courses_id":"522","courseAverage":85.75,"maxFail":0},{"courses_dept":"dent","courses_id":"595","courseAverage":85.75,"maxFail":0},{"courses_dept":"asia","courses_id":"307","courseAverage":85.76,"maxFail":0},{"courses_dept":"libr","courses_id":"534","courseAverage":85.76,"maxFail":0},{"courses_dept":"econ","courses_id":"546","courseAverage":85.77,"maxFail":0},{"courses_dept":"gsat","courses_id":"540","courseAverage":85.77,"maxFail":0},{"courses_dept":"chem","courses_id":"526","courseAverage":85.78,"maxFail":0},{"courses_dept":"libr","courses_id":"535","courseAverage":85.79,"maxFail":0},{"courses_dept":"libr","courses_id":"554","courseAverage":85.79,"maxFail":0},{"courses_dept":"civl","courses_id":"426","courseAverage":85.81,"maxFail":0},{"courses_dept":"cpsc","courses_id":"589","courseAverage":85.82,"maxFail":0},{"courses_dept":"eosc","courses_id":"449","courseAverage":85.82,"maxFail":0},{"courses_dept":"phar","courses_id":"400","courseAverage":85.82,"maxFail":0},{"courses_dept":"asia","courses_id":"370","courseAverage":85.82,"maxFail":1},{"courses_dept":"path","courses_id":"402","courseAverage":85.83,"maxFail":0},{"courses_dept":"spph","courses_id":"565","courseAverage":85.83,"maxFail":0},{"courses_dept":"eece","courses_id":"527","courseAverage":85.85,"maxFail":0},{"courses_dept":"eece","courses_id":"562","courseAverage":85.85,"maxFail":0},{"courses_dept":"libe","courses_id":"461","courseAverage":85.85,"maxFail":1},{"courses_dept":"astr","courses_id":"449","courseAverage":85.86,"maxFail":0},{"courses_dept":"eosc","courses_id":"546","courseAverage":85.88,"maxFail":0},{"courses_dept":"caps","courses_id":"200","courseAverage":85.89,"maxFail":0},{"courses_dept":"civl","courses_id":"445","courseAverage":85.92,"maxFail":0},{"courses_dept":"dent","courses_id":"544","courseAverage":85.92,"maxFail":0},{"courses_dept":"fren","courses_id":"499","courseAverage":85.92,"maxFail":0},{"courses_dept":"geog","courses_id":"535","courseAverage":85.92,"maxFail":0},{"courses_dept":"bams","courses_id":"501","courseAverage":85.93,"maxFail":0},{"courses_dept":"iar","courses_id":"520","courseAverage":85.94,"maxFail":0},{"courses_dept":"dent","courses_id":"567","courseAverage":85.95,"maxFail":0},{"courses_dept":"mech","courses_id":"520","courseAverage":85.96,"maxFail":0},{"courses_dept":"biol","courses_id":"530","courseAverage":85.97,"maxFail":0},{"courses_dept":"rsot","courses_id":"515","courseAverage":85.97,"maxFail":0},{"courses_dept":"sowk","courses_id":"550","courseAverage":85.98,"maxFail":0},{"courses_dept":"bafi","courses_id":"513","courseAverage":85.99,"maxFail":0},{"courses_dept":"dent","courses_id":"410","courseAverage":85.99,"maxFail":0},{"courses_dept":"ling","courses_id":"432","courseAverage":85.99,"maxFail":0},{"courses_dept":"phys","courses_id":"449","courseAverage":85.99,"maxFail":1},{"courses_dept":"astr","courses_id":"514","courseAverage":86,"maxFail":0},{"courses_dept":"edcp","courses_id":"513","courseAverage":86,"maxFail":0},{"courses_dept":"thtr","courses_id":"506","courseAverage":86,"maxFail":0},{"courses_dept":"chbe","courses_id":"599","courseAverage":86.02,"maxFail":0},{"courses_dept":"mine","courses_id":"597","courseAverage":86.02,"maxFail":0},{"courses_dept":"eced","courses_id":"438","courseAverage":86.02,"maxFail":1},{"courses_dept":"geog","courses_id":"525","courseAverage":86.04,"maxFail":0},{"courses_dept":"ccst","courses_id":"502","courseAverage":86.05,"maxFail":0},{"courses_dept":"libr","courses_id":"594","courseAverage":86.05,"maxFail":0},{"courses_dept":"thtr","courses_id":"405","courseAverage":86.05,"maxFail":0},{"courses_dept":"mtrl","courses_id":"594","courseAverage":86.06,"maxFail":0},{"courses_dept":"comm","courses_id":"525","courseAverage":86.08,"maxFail":0},{"courses_dept":"libr","courses_id":"580","courseAverage":86.08,"maxFail":0},{"courses_dept":"phth","courses_id":"545","courseAverage":86.08,"maxFail":0},{"courses_dept":"libr","courses_id":"504","courseAverage":86.08,"maxFail":1},{"courses_dept":"libr","courses_id":"531","courseAverage":86.09,"maxFail":0},{"courses_dept":"rsot","courses_id":"511","courseAverage":86.1,"maxFail":0},{"courses_dept":"arst","courses_id":"540","courseAverage":86.12,"maxFail":0},{"courses_dept":"cnps","courses_id":"363","courseAverage":86.12,"maxFail":5},{"courses_dept":"sts","courses_id":"501","courseAverage":86.13,"maxFail":0},{"courses_dept":"apbi","courses_id":"440","courseAverage":86.14,"maxFail":0},{"courses_dept":"ling","courses_id":"520","courseAverage":86.14,"maxFail":0},{"courses_dept":"civl","courses_id":"504","courseAverage":86.15,"maxFail":1},{"courses_dept":"rmes","courses_id":"510","courseAverage":86.16,"maxFail":0},{"courses_dept":"sowk","courses_id":"405","courseAverage":86.16,"maxFail":0},{"courses_dept":"edst","courses_id":"511","courseAverage":86.16,"maxFail":1},{"courses_dept":"spph","courses_id":"516","courseAverage":86.17,"maxFail":0},{"courses_dept":"ling","courses_id":"508","courseAverage":86.18,"maxFail":0},{"courses_dept":"bafi","courses_id":"516","courseAverage":86.2,"maxFail":0},{"courses_dept":"medg","courses_id":"530","courseAverage":86.21,"maxFail":0},{"courses_dept":"sowk","courses_id":"501","courseAverage":86.21,"maxFail":0},{"courses_dept":"dhyg","courses_id":"461","courseAverage":86.21,"maxFail":1},{"courses_dept":"plan","courses_id":"602","courseAverage":86.23,"maxFail":0},{"courses_dept":"chbe","courses_id":"583","courseAverage":86.24,"maxFail":0},{"courses_dept":"edcp","courses_id":"498","courseAverage":86.24,"maxFail":0},{"courses_dept":"dent","courses_id":"529","courseAverage":86.25,"maxFail":0},{"courses_dept":"dent","courses_id":"530","courseAverage":86.25,"maxFail":0},{"courses_dept":"etec","courses_id":"522","courseAverage":86.25,"maxFail":0},{"courses_dept":"mtrl","courses_id":"562","courseAverage":86.25,"maxFail":0},{"courses_dept":"eece","courses_id":"597","courseAverage":86.26,"maxFail":0},{"courses_dept":"lled","courses_id":"469","courseAverage":86.26,"maxFail":0},{"courses_dept":"mech","courses_id":"506","courseAverage":86.26,"maxFail":0},{"courses_dept":"musc","courses_id":"311","courseAverage":86.26,"maxFail":0},{"courses_dept":"math","courses_id":"521","courseAverage":86.27,"maxFail":1},{"courses_dept":"fipr","courses_id":"338","courseAverage":86.29,"maxFail":1},{"courses_dept":"chbe","courses_id":"563","courseAverage":86.31,"maxFail":0},{"courses_dept":"frst","courses_id":"557","courseAverage":86.31,"maxFail":0},{"courses_dept":"adhe","courses_id":"330","courseAverage":86.31,"maxFail":3},{"courses_dept":"eosc","courses_id":"561","courseAverage":86.33,"maxFail":0},{"courses_dept":"hist","courses_id":"549","courseAverage":86.33,"maxFail":0},{"courses_dept":"lled","courses_id":"446","courseAverage":86.33,"maxFail":0},{"courses_dept":"apbi","courses_id":"265","courseAverage":86.35,"maxFail":0},{"courses_dept":"dent","courses_id":"575","courseAverage":86.38,"maxFail":0},{"courses_dept":"hunu","courses_id":"500","courseAverage":86.38,"maxFail":0},{"courses_dept":"nurs","courses_id":"508","courseAverage":86.38,"maxFail":0},{"courses_dept":"micb","courses_id":"406","courseAverage":86.39,"maxFail":1},{"courses_dept":"fopr","courses_id":"459","courseAverage":86.41,"maxFail":0},{"courses_dept":"phys","courses_id":"571","courseAverage":86.41,"maxFail":0},{"courses_dept":"rhsc","courses_id":"502","courseAverage":86.42,"maxFail":0},{"courses_dept":"medi","courses_id":"501","courseAverage":86.42,"maxFail":1},{"courses_dept":"civl","courses_id":"407","courseAverage":86.44,"maxFail":0},{"courses_dept":"cpsc","courses_id":"540","courseAverage":86.46,"maxFail":0},{"courses_dept":"thtr","courses_id":"352","courseAverage":86.46,"maxFail":0},{"courses_dept":"thtr","courses_id":"471","courseAverage":86.46,"maxFail":0},{"courses_dept":"econ","courses_id":"627","courseAverage":86.46,"maxFail":1},{"courses_dept":"ccst","courses_id":"501","courseAverage":86.48,"maxFail":0},{"courses_dept":"pcth","courses_id":"404","courseAverage":86.49,"maxFail":0},{"courses_dept":"mine","courses_id":"598","courseAverage":86.49,"maxFail":1},{"courses_dept":"cnps","courses_id":"362","courseAverage":86.5,"maxFail":0},{"courses_dept":"eosc","courses_id":"578","courseAverage":86.5,"maxFail":0},{"courses_dept":"medg","courses_id":"550","courseAverage":86.5,"maxFail":0},{"courses_dept":"phys","courses_id":"572","courseAverage":86.5,"maxFail":0},{"courses_dept":"fre","courses_id":"525","courseAverage":86.51,"maxFail":0},{"courses_dept":"rmes","courses_id":"502","courseAverage":86.52,"maxFail":0},{"courses_dept":"chem","courses_id":"405","courseAverage":86.53,"maxFail":0},{"courses_dept":"fish","courses_id":"520","courseAverage":86.53,"maxFail":0},{"courses_dept":"nurs","courses_id":"540","courseAverage":86.53,"maxFail":0},{"courses_dept":"phys","courses_id":"535","courseAverage":86.53,"maxFail":0},{"courses_dept":"rhsc","courses_id":"500","courseAverage":86.53,"maxFail":0},{"courses_dept":"audi","courses_id":"586","courseAverage":86.54,"maxFail":0},{"courses_dept":"eece","courses_id":"550","courseAverage":86.54,"maxFail":1},{"courses_dept":"audi","courses_id":"522","courseAverage":86.55,"maxFail":0},{"courses_dept":"anth","courses_id":"500","courseAverage":86.56,"maxFail":0},{"courses_dept":"arst","courses_id":"570","courseAverage":86.56,"maxFail":0},{"courses_dept":"ccst","courses_id":"500","courseAverage":86.56,"maxFail":0},{"courses_dept":"isci","courses_id":"311","courseAverage":86.56,"maxFail":0},{"courses_dept":"midw","courses_id":"310","courseAverage":86.56,"maxFail":0},{"courses_dept":"path","courses_id":"549","courseAverage":86.59,"maxFail":0},{"courses_dept":"geog","courses_id":"599","courseAverage":86.6,"maxFail":0},{"courses_dept":"libr","courses_id":"582","courseAverage":86.61,"maxFail":0},{"courses_dept":"nurs","courses_id":"424","courseAverage":86.61,"maxFail":0},{"courses_dept":"kin","courses_id":"564","courseAverage":86.62,"maxFail":0},{"courses_dept":"frst","courses_id":"551","courseAverage":86.63,"maxFail":0},{"courses_dept":"nurs","courses_id":"341","courseAverage":86.63,"maxFail":0},{"courses_dept":"thtr","courses_id":"473","courseAverage":86.63,"maxFail":0},{"courses_dept":"chem","courses_id":"573","courseAverage":86.64,"maxFail":0},{"courses_dept":"phar","courses_id":"518","courseAverage":86.66,"maxFail":0},{"courses_dept":"thtr","courses_id":"472","courseAverage":86.66,"maxFail":0},{"courses_dept":"thtr","courses_id":"474","courseAverage":86.66,"maxFail":0},{"courses_dept":"anat","courses_id":"515","courseAverage":86.67,"maxFail":0},{"courses_dept":"mech","courses_id":"533","courseAverage":86.68,"maxFail":1},{"courses_dept":"anth","courses_id":"516","courseAverage":86.72,"maxFail":0},{"courses_dept":"eece","courses_id":"580","courseAverage":86.73,"maxFail":0},{"courses_dept":"nurs","courses_id":"570","courseAverage":86.74,"maxFail":0},{"courses_dept":"ling","courses_id":"532","courseAverage":86.75,"maxFail":0},{"courses_dept":"phth","courses_id":"511","courseAverage":86.75,"maxFail":0},{"courses_dept":"dent","courses_id":"555","courseAverage":86.77,"maxFail":0},{"courses_dept":"nurs","courses_id":"596","courseAverage":86.77,"maxFail":0},{"courses_dept":"russ","courses_id":"316","courseAverage":86.78,"maxFail":0},{"courses_dept":"anth","courses_id":"528","courseAverage":86.79,"maxFail":0},{"courses_dept":"econ","courses_id":"531","courseAverage":86.79,"maxFail":0},{"courses_dept":"eosc","courses_id":"547","courseAverage":86.79,"maxFail":0},{"courses_dept":"dhyg","courses_id":"400","courseAverage":86.79,"maxFail":1},{"courses_dept":"soil","courses_id":"502","courseAverage":86.8,"maxFail":0},{"courses_dept":"audi","courses_id":"581","courseAverage":86.82,"maxFail":0},{"courses_dept":"math","courses_id":"421","courseAverage":86.82,"maxFail":0},{"courses_dept":"medi","courses_id":"530","courseAverage":86.82,"maxFail":0},{"courses_dept":"jrnl","courses_id":"534","courseAverage":86.83,"maxFail":0},{"courses_dept":"libr","courses_id":"575","courseAverage":86.83,"maxFail":0},{"courses_dept":"ling","courses_id":"518","courseAverage":86.83,"maxFail":0},{"courses_dept":"visa","courses_id":"581","courseAverage":86.83,"maxFail":0},{"courses_dept":"hist","courses_id":"560","courseAverage":86.84,"maxFail":0},{"courses_dept":"anth","courses_id":"517","courseAverage":86.85,"maxFail":0},{"courses_dept":"etec","courses_id":"520","courseAverage":86.85,"maxFail":0},{"courses_dept":"mech","courses_id":"555","courseAverage":86.85,"maxFail":0},{"courses_dept":"stat","courses_id":"550","courseAverage":86.85,"maxFail":0},{"courses_dept":"chem","courses_id":"501","courseAverage":86.86,"maxFail":0},{"courses_dept":"edst","courses_id":"575","courseAverage":86.86,"maxFail":0},{"courses_dept":"math","courses_id":"539","courseAverage":86.87,"maxFail":0},{"courses_dept":"kin","courses_id":"366","courseAverage":86.87,"maxFail":1},{"courses_dept":"edst","courses_id":"518","courseAverage":86.88,"maxFail":0},{"courses_dept":"libe","courses_id":"463","courseAverage":86.88,"maxFail":0},{"courses_dept":"ling","courses_id":"525","courseAverage":86.88,"maxFail":0},{"courses_dept":"rmes","courses_id":"550","courseAverage":86.9,"maxFail":0},{"courses_dept":"spph","courses_id":"547","courseAverage":86.9,"maxFail":0},{"courses_dept":"libr","courses_id":"532","courseAverage":86.91,"maxFail":0},{"courses_dept":"lled","courses_id":"462","courseAverage":86.91,"maxFail":0},{"courses_dept":"kin","courses_id":"570","courseAverage":86.92,"maxFail":0},{"courses_dept":"rsot","courses_id":"519","courseAverage":86.92,"maxFail":0},{"courses_dept":"cell","courses_id":"509","courseAverage":86.93,"maxFail":0},{"courses_dept":"midw","courses_id":"105","courseAverage":86.94,"maxFail":0},{"courses_dept":"medi","courses_id":"570","courseAverage":86.96,"maxFail":0},{"courses_dept":"phys","courses_id":"526","courseAverage":86.97,"maxFail":2},{"courses_dept":"bmeg","courses_id":"599","courseAverage":86.99,"maxFail":0},{"courses_dept":"lfs","courses_id":"501","courseAverage":86.99,"maxFail":0},{"courses_dept":"anat","courses_id":"511","courseAverage":87,"maxFail":0},{"courses_dept":"audi","courses_id":"516","courseAverage":87,"maxFail":0},{"courses_dept":"chem","courses_id":"503","courseAverage":87,"maxFail":0},{"courses_dept":"obst","courses_id":"549","courseAverage":87,"maxFail":0},{"courses_dept":"soci","courses_id":"500","courseAverage":87,"maxFail":0},{"courses_dept":"chbe","courses_id":"495","courseAverage":87.01,"maxFail":0},{"courses_dept":"bota","courses_id":"501","courseAverage":87.02,"maxFail":0},{"courses_dept":"epse","courses_id":"593","courseAverage":87.04,"maxFail":0},{"courses_dept":"nurs","courses_id":"339","courseAverage":87.05,"maxFail":0},{"courses_dept":"rhsc","courses_id":"509","courseAverage":87.05,"maxFail":0},{"courses_dept":"ceen","courses_id":"596","courseAverage":87.06,"maxFail":0},{"courses_dept":"spph","courses_id":"519","courseAverage":87.06,"maxFail":0},{"courses_dept":"edst","courses_id":"597","courseAverage":87.06,"maxFail":1},{"courses_dept":"medi","courses_id":"549","courseAverage":87.08,"maxFail":0},{"courses_dept":"rmes","courses_id":"599","courseAverage":87.1,"maxFail":0},{"courses_dept":"frst","courses_id":"351","courseAverage":87.11,"maxFail":0},{"courses_dept":"micb","courses_id":"507","courseAverage":87.11,"maxFail":0},{"courses_dept":"eece","courses_id":"549","courseAverage":87.12,"maxFail":0},{"courses_dept":"psyc","courses_id":"531","courseAverage":87.12,"maxFail":0},{"courses_dept":"soil","courses_id":"503","courseAverage":87.12,"maxFail":0},{"courses_dept":"dent","courses_id":"722","courseAverage":87.13,"maxFail":0},{"courses_dept":"audi","courses_id":"572","courseAverage":87.14,"maxFail":0},{"courses_dept":"arth","courses_id":"571","courseAverage":87.15,"maxFail":0},{"courses_dept":"audi","courses_id":"526","courseAverage":87.15,"maxFail":0},{"courses_dept":"edst","courses_id":"581","courseAverage":87.15,"maxFail":0},{"courses_dept":"lled","courses_id":"450","courseAverage":87.16,"maxFail":1},{"courses_dept":"civl","courses_id":"446","courseAverage":87.16,"maxFail":3},{"courses_dept":"rmes","courses_id":"520","courseAverage":87.17,"maxFail":0},{"courses_dept":"rsot","courses_id":"547","courseAverage":87.17,"maxFail":0},{"courses_dept":"sowk","courses_id":"516","courseAverage":87.17,"maxFail":0},{"courses_dept":"econ","courses_id":"628","courseAverage":87.18,"maxFail":0},{"courses_dept":"edcp","courses_id":"537","courseAverage":87.18,"maxFail":0},{"courses_dept":"spph","courses_id":"513","courseAverage":87.18,"maxFail":0},{"courses_dept":"epse","courses_id":"576","courseAverage":87.21,"maxFail":0},{"courses_dept":"chbe","courses_id":"494","courseAverage":87.25,"maxFail":0},{"courses_dept":"rmes","courses_id":"507","courseAverage":87.25,"maxFail":0},{"courses_dept":"dhyg","courses_id":"462","courseAverage":87.25,"maxFail":1},{"courses_dept":"geob","courses_id":"501","courseAverage":87.26,"maxFail":0},{"courses_dept":"audi","courses_id":"518","courseAverage":87.27,"maxFail":0},{"courses_dept":"chbe","courses_id":"486","courseAverage":87.27,"maxFail":0},{"courses_dept":"hist","courses_id":"699","courseAverage":87.27,"maxFail":0},{"courses_dept":"pcth","courses_id":"300","courseAverage":87.27,"maxFail":0},{"courses_dept":"thtr","courses_id":"505","courseAverage":87.28,"maxFail":0},{"courses_dept":"gsat","courses_id":"501","courseAverage":87.29,"maxFail":0},{"courses_dept":"audi","courses_id":"552","courseAverage":87.31,"maxFail":0},{"courses_dept":"dani","courses_id":"100","courseAverage":87.31,"maxFail":0},{"courses_dept":"cpsc","courses_id":"543","courseAverage":87.32,"maxFail":0},{"courses_dept":"caps","courses_id":"430","courseAverage":87.33,"maxFail":0},{"courses_dept":"dent","courses_id":"573","courseAverage":87.33,"maxFail":0},{"courses_dept":"dent","courses_id":"578","courseAverage":87.33,"maxFail":0},{"courses_dept":"edcp","courses_id":"305","courseAverage":87.33,"maxFail":0},{"courses_dept":"eced","courses_id":"439","courseAverage":87.33,"maxFail":1},{"courses_dept":"math","courses_id":"537","courseAverage":87.33,"maxFail":1},{"courses_dept":"spph","courses_id":"527","courseAverage":87.35,"maxFail":0},{"courses_dept":"clst","courses_id":"502","courseAverage":87.36,"maxFail":0},{"courses_dept":"edst","courses_id":"501","courseAverage":87.36,"maxFail":0},{"courses_dept":"lled","courses_id":"557","courseAverage":87.36,"maxFail":0},{"courses_dept":"visa","courses_id":"582","courseAverage":87.36,"maxFail":0},{"courses_dept":"edst","courses_id":"521","courseAverage":87.37,"maxFail":0},{"courses_dept":"musc","courses_id":"167","courseAverage":87.38,"maxFail":0},{"courses_dept":"phar","courses_id":"554","courseAverage":87.38,"maxFail":0},{"courses_dept":"spph","courses_id":"534","courseAverage":87.38,"maxFail":0},{"courses_dept":"eece","courses_id":"599","courseAverage":87.4,"maxFail":0},{"courses_dept":"spph","courses_id":"533","courseAverage":87.4,"maxFail":0},{"courses_dept":"edcp","courses_id":"491","courseAverage":87.41,"maxFail":0},{"courses_dept":"edcp","courses_id":"553","courseAverage":87.41,"maxFail":0},{"courses_dept":"frst","courses_id":"546","courseAverage":87.41,"maxFail":0},{"courses_dept":"obst","courses_id":"501","courseAverage":87.41,"maxFail":0},{"courses_dept":"econ","courses_id":"526","courseAverage":87.41,"maxFail":1},{"courses_dept":"germ","courses_id":"325","courseAverage":87.43,"maxFail":0},{"courses_dept":"udes","courses_id":"502","courseAverage":87.44,"maxFail":0},{"courses_dept":"nurs","courses_id":"506","courseAverage":87.45,"maxFail":0},{"courses_dept":"epse","courses_id":"575","courseAverage":87.46,"maxFail":0},{"courses_dept":"pcth","courses_id":"502","courseAverage":87.46,"maxFail":0},{"courses_dept":"nurs","courses_id":"530","courseAverage":87.47,"maxFail":0},{"courses_dept":"lled","courses_id":"552","courseAverage":87.48,"maxFail":0},{"courses_dept":"phys","courses_id":"536","courseAverage":87.48,"maxFail":0},{"courses_dept":"cell","courses_id":"511","courseAverage":87.49,"maxFail":0},{"courses_dept":"chbe","courses_id":"575","courseAverage":87.49,"maxFail":0},{"courses_dept":"eosc","courses_id":"513","courseAverage":87.49,"maxFail":0},{"courses_dept":"rhsc","courses_id":"585","courseAverage":87.5,"maxFail":0},{"courses_dept":"frst","courses_id":"516","courseAverage":87.52,"maxFail":0},{"courses_dept":"stat","courses_id":"560","courseAverage":87.52,"maxFail":0},{"courses_dept":"apbi","courses_id":"499","courseAverage":87.53,"maxFail":0},{"courses_dept":"chbe","courses_id":"597","courseAverage":87.53,"maxFail":0},{"courses_dept":"econ","courses_id":"560","courseAverage":87.53,"maxFail":0},{"courses_dept":"mech","courses_id":"598","courseAverage":87.53,"maxFail":0},{"courses_dept":"psyc","courses_id":"594","courseAverage":87.53,"maxFail":0},{"courses_dept":"spph","courses_id":"515","courseAverage":87.53,"maxFail":0},{"courses_dept":"thtr","courses_id":"456","courseAverage":87.53,"maxFail":0},{"courses_dept":"rsot","courses_id":"551","courseAverage":87.54,"maxFail":0},{"courses_dept":"bota","courses_id":"544","courseAverage":87.58,"maxFail":0},{"courses_dept":"audi","courses_id":"585","courseAverage":87.59,"maxFail":0},{"courses_dept":"epse","courses_id":"568","courseAverage":87.59,"maxFail":0},{"courses_dept":"dent","courses_id":"524","courseAverage":87.6,"maxFail":0},{"courses_dept":"sowk","courses_id":"510","courseAverage":87.61,"maxFail":0},{"courses_dept":"path","courses_id":"451","courseAverage":87.62,"maxFail":0},{"courses_dept":"nurs","courses_id":"423","courseAverage":87.62,"maxFail":1},{"courses_dept":"cnps","courses_id":"426","courseAverage":87.62,"maxFail":3},{"courses_dept":"fnh","courses_id":"475","courseAverage":87.63,"maxFail":1},{"courses_dept":"plan","courses_id":"603","courseAverage":87.64,"maxFail":0},{"courses_dept":"audi","courses_id":"524","courseAverage":87.65,"maxFail":0},{"courses_dept":"dhyg","courses_id":"412","courseAverage":87.65,"maxFail":0},{"courses_dept":"grsj","courses_id":"500","courseAverage":87.66,"maxFail":0},{"courses_dept":"path","courses_id":"531","courseAverage":87.66,"maxFail":0},{"courses_dept":"spph","courses_id":"543","courseAverage":87.67,"maxFail":0},{"courses_dept":"rhsc","courses_id":"505","courseAverage":87.68,"maxFail":0},{"courses_dept":"midw","courses_id":"104","courseAverage":87.7,"maxFail":0},{"courses_dept":"cens","courses_id":"307","courseAverage":87.7,"maxFail":1},{"courses_dept":"chem","courses_id":"401","courseAverage":87.73,"maxFail":0},{"courses_dept":"econ","courses_id":"603","courseAverage":87.73,"maxFail":0},{"courses_dept":"frst","courses_id":"547","courseAverage":87.73,"maxFail":0},{"courses_dept":"lled","courses_id":"526","courseAverage":87.74,"maxFail":0},{"courses_dept":"econ","courses_id":"499","courseAverage":87.75,"maxFail":0},{"courses_dept":"frst","courses_id":"508","courseAverage":87.75,"maxFail":0},{"courses_dept":"spph","courses_id":"520","courseAverage":87.75,"maxFail":0},{"courses_dept":"eece","courses_id":"584","courseAverage":87.76,"maxFail":0},{"courses_dept":"biof","courses_id":"540","courseAverage":87.81,"maxFail":0},{"courses_dept":"envr","courses_id":"449","courseAverage":87.81,"maxFail":0},{"courses_dept":"plan","courses_id":"542","courseAverage":87.82,"maxFail":0},{"courses_dept":"spph","courses_id":"526","courseAverage":87.82,"maxFail":0},{"courses_dept":"atsc","courses_id":"500","courseAverage":87.83,"maxFail":0},{"courses_dept":"mech","courses_id":"698","courseAverage":87.83,"maxFail":0},{"courses_dept":"micb","courses_id":"412","courseAverage":87.83,"maxFail":0},{"courses_dept":"stat","courses_id":"589","courseAverage":87.83,"maxFail":0},{"courses_dept":"thtr","courses_id":"452","courseAverage":87.84,"maxFail":0},{"courses_dept":"frst","courses_id":"544","courseAverage":87.86,"maxFail":0},{"courses_dept":"edst","courses_id":"577","courseAverage":87.87,"maxFail":0},{"courses_dept":"sowk","courses_id":"316","courseAverage":87.89,"maxFail":0},{"courses_dept":"medg","courses_id":"520","courseAverage":87.9,"maxFail":0},{"courses_dept":"thtr","courses_id":"350","courseAverage":87.9,"maxFail":0},{"courses_dept":"path","courses_id":"635","courseAverage":87.92,"maxFail":0},{"courses_dept":"phth","courses_id":"544","courseAverage":87.92,"maxFail":0},{"courses_dept":"obst","courses_id":"506","courseAverage":87.95,"maxFail":0},{"courses_dept":"epse","courses_id":"403","courseAverage":87.98,"maxFail":1},{"courses_dept":"midw","courses_id":"102","courseAverage":87.99,"maxFail":0},{"courses_dept":"cnps","courses_id":"535","courseAverage":88,"maxFail":0},{"courses_dept":"fnh","courses_id":"460","courseAverage":88,"maxFail":0},{"courses_dept":"germ","courses_id":"548","courseAverage":88,"maxFail":0},{"courses_dept":"grsj","courses_id":"502","courseAverage":88,"maxFail":0},{"courses_dept":"sowk","courses_id":"551","courseAverage":88,"maxFail":0},{"courses_dept":"spph","courses_id":"562","courseAverage":88,"maxFail":0},{"courses_dept":"edst","courses_id":"588","courseAverage":88.01,"maxFail":0},{"courses_dept":"hunu","courses_id":"505","courseAverage":88.01,"maxFail":0},{"courses_dept":"spph","courses_id":"510","courseAverage":88.01,"maxFail":0},{"courses_dept":"audi","courses_id":"563","courseAverage":88.02,"maxFail":0},{"courses_dept":"psyc","courses_id":"536","courseAverage":88.02,"maxFail":0},{"courses_dept":"mech","courses_id":"592","courseAverage":88.02,"maxFail":1},{"courses_dept":"eece","courses_id":"574","courseAverage":88.03,"maxFail":0},{"courses_dept":"psyc","courses_id":"530","courseAverage":88.03,"maxFail":0},{"courses_dept":"grsj","courses_id":"501","courseAverage":88.06,"maxFail":0},{"courses_dept":"fish","courses_id":"500","courseAverage":88.07,"maxFail":0},{"courses_dept":"math","courses_id":"501","courseAverage":88.07,"maxFail":0},{"courses_dept":"phys","courses_id":"506","courseAverage":88.07,"maxFail":0},{"courses_dept":"biol","courses_id":"428","courseAverage":88.09,"maxFail":0},{"courses_dept":"eosc","courses_id":"510","courseAverage":88.1,"maxFail":0},{"courses_dept":"epse","courses_id":"503","courseAverage":88.12,"maxFail":1},{"courses_dept":"cell","courses_id":"503","courseAverage":88.13,"maxFail":0},{"courses_dept":"ccst","courses_id":"503","courseAverage":88.14,"maxFail":0},{"courses_dept":"chbe","courses_id":"496","courseAverage":88.14,"maxFail":0},{"courses_dept":"dent","courses_id":"542","courseAverage":88.14,"maxFail":0},{"courses_dept":"lled","courses_id":"577","courseAverage":88.14,"maxFail":0},{"courses_dept":"caps","courses_id":"422","courseAverage":88.16,"maxFail":0},{"courses_dept":"nurs","courses_id":"338","courseAverage":88.16,"maxFail":0},{"courses_dept":"civl","courses_id":"581","courseAverage":88.17,"maxFail":0},{"courses_dept":"edst","courses_id":"582","courseAverage":88.17,"maxFail":0},{"courses_dept":"psyc","courses_id":"549","courseAverage":88.17,"maxFail":0},{"courses_dept":"cell","courses_id":"502","courseAverage":88.19,"maxFail":0},{"courses_dept":"edst","courses_id":"535","courseAverage":88.2,"maxFail":0},{"courses_dept":"chem","courses_id":"533","courseAverage":88.21,"maxFail":0},{"courses_dept":"epse","courses_id":"505","courseAverage":88.24,"maxFail":0},{"courses_dept":"libr","courses_id":"597","courseAverage":88.24,"maxFail":0},{"courses_dept":"soci","courses_id":"501","courseAverage":88.24,"maxFail":0},{"courses_dept":"hgse","courses_id":"355","courseAverage":88.26,"maxFail":0},{"courses_dept":"phar","courses_id":"499","courseAverage":88.28,"maxFail":0},{"courses_dept":"phth","courses_id":"527","courseAverage":88.28,"maxFail":0},{"courses_dept":"epse","courses_id":"519","courseAverage":88.29,"maxFail":0},{"courses_dept":"frst","courses_id":"512","courseAverage":88.29,"maxFail":0},{"courses_dept":"biol","courses_id":"462","courseAverage":88.31,"maxFail":0},{"courses_dept":"sowk","courses_id":"559","courseAverage":88.31,"maxFail":0},{"courses_dept":"cell","courses_id":"512","courseAverage":88.33,"maxFail":0},{"courses_dept":"econ","courses_id":"327","courseAverage":88.33,"maxFail":0},{"courses_dept":"etec","courses_id":"512","courseAverage":88.33,"maxFail":1},{"courses_dept":"audi","courses_id":"528","courseAverage":88.35,"maxFail":0},{"courses_dept":"musc","courses_id":"557","courseAverage":88.37,"maxFail":0},{"courses_dept":"psyc","courses_id":"349","courseAverage":88.38,"maxFail":0},{"courses_dept":"audi","courses_id":"553","courseAverage":88.39,"maxFail":0},{"courses_dept":"musc","courses_id":"164","courseAverage":88.4,"maxFail":0},{"courses_dept":"nurs","courses_id":"571","courseAverage":88.4,"maxFail":0},{"courses_dept":"sts","courses_id":"502","courseAverage":88.4,"maxFail":0},{"courses_dept":"cpsc","courses_id":"503","courseAverage":88.43,"maxFail":0},{"courses_dept":"phth","courses_id":"526","courseAverage":88.44,"maxFail":0},{"courses_dept":"psyc","courses_id":"508","courseAverage":88.44,"maxFail":0},{"courses_dept":"psyc","courses_id":"449","courseAverage":88.45,"maxFail":0},{"courses_dept":"educ","courses_id":"500","courseAverage":88.46,"maxFail":0},{"courses_dept":"phil","courses_id":"487","courseAverage":88.46,"maxFail":0},{"courses_dept":"cpsc","courses_id":"547","courseAverage":88.47,"maxFail":0},{"courses_dept":"eosc","courses_id":"522","courseAverage":88.47,"maxFail":0},{"courses_dept":"math","courses_id":"552","courseAverage":88.48,"maxFail":0},{"courses_dept":"cell","courses_id":"504","courseAverage":88.49,"maxFail":0},{"courses_dept":"audi","courses_id":"557","courseAverage":88.5,"maxFail":0},{"courses_dept":"audi","courses_id":"583","courseAverage":88.5,"maxFail":0},{"courses_dept":"micb","courses_id":"449","courseAverage":88.5,"maxFail":0},{"courses_dept":"lled","courses_id":"601","courseAverage":88.51,"maxFail":0},{"courses_dept":"cell","courses_id":"501","courseAverage":88.52,"maxFail":0},{"courses_dept":"musc","courses_id":"163","courseAverage":88.52,"maxFail":0},{"courses_dept":"phar","courses_id":"548","courseAverage":88.53,"maxFail":0},{"courses_dept":"sowk","courses_id":"505","courseAverage":88.53,"maxFail":0},{"courses_dept":"medi","courses_id":"560","courseAverage":88.54,"maxFail":0},{"courses_dept":"math","courses_id":"427","courseAverage":88.55,"maxFail":0},{"courses_dept":"cpsc","courses_id":"507","courseAverage":88.57,"maxFail":0},{"courses_dept":"chil","courses_id":"599","courseAverage":88.6,"maxFail":0},{"courses_dept":"phth","courses_id":"528","courseAverage":88.6,"maxFail":0},{"courses_dept":"medg","courses_id":"545","courseAverage":88.61,"maxFail":0},{"courses_dept":"edcp","courses_id":"551","courseAverage":88.62,"maxFail":0},{"courses_dept":"epse","courses_id":"595","courseAverage":88.64,"maxFail":1},{"courses_dept":"nurs","courses_id":"344","courseAverage":88.65,"maxFail":0},{"courses_dept":"plan","courses_id":"580","courseAverage":88.65,"maxFail":0},{"courses_dept":"edst","courses_id":"503","courseAverage":88.66,"maxFail":0},{"courses_dept":"eece","courses_id":"592","courseAverage":88.67,"maxFail":0},{"courses_dept":"plan","courses_id":"592","courseAverage":88.67,"maxFail":0},{"courses_dept":"sowk","courses_id":"601","courseAverage":88.67,"maxFail":0},{"courses_dept":"kin","courses_id":"400","courseAverage":88.67,"maxFail":2},{"courses_dept":"audi","courses_id":"576","courseAverage":88.71,"maxFail":0},{"courses_dept":"chem","courses_id":"514","courseAverage":88.71,"maxFail":0},{"courses_dept":"epse","courses_id":"481","courseAverage":88.71,"maxFail":0},{"courses_dept":"edcp","courses_id":"566","courseAverage":88.72,"maxFail":0},{"courses_dept":"eosc","courses_id":"520","courseAverage":88.74,"maxFail":0},{"courses_dept":"bioc","courses_id":"521","courseAverage":88.75,"maxFail":0},{"courses_dept":"eosc","courses_id":"562","courseAverage":88.75,"maxFail":0},{"courses_dept":"frst","courses_id":"413","courseAverage":88.75,"maxFail":0},{"courses_dept":"path","courses_id":"547","courseAverage":88.75,"maxFail":0},{"courses_dept":"psyc","courses_id":"523","courseAverage":88.75,"maxFail":0},{"courses_dept":"chbe","courses_id":"553","courseAverage":88.76,"maxFail":0},{"courses_dept":"zool","courses_id":"549","courseAverage":88.79,"maxFail":0},{"courses_dept":"ling","courses_id":"449","courseAverage":88.8,"maxFail":0},{"courses_dept":"math","courses_id":"550","courseAverage":88.84,"maxFail":0},{"courses_dept":"phys","courses_id":"503","courseAverage":88.85,"maxFail":0},{"courses_dept":"spph","courses_id":"524","courseAverage":88.86,"maxFail":0},{"courses_dept":"audi","courses_id":"575","courseAverage":88.87,"maxFail":0},{"courses_dept":"educ","courses_id":"504","courseAverage":88.87,"maxFail":0},{"courses_dept":"educ","courses_id":"211","courseAverage":88.88,"maxFail":0},{"courses_dept":"cnps","courses_id":"579","courseAverage":88.9,"maxFail":0},{"courses_dept":"phar","courses_id":"502","courseAverage":88.9,"maxFail":0},{"courses_dept":"thtr","courses_id":"356","courseAverage":88.9,"maxFail":1},{"courses_dept":"epse","courses_id":"316","courseAverage":88.92,"maxFail":0},{"courses_dept":"etec","courses_id":"533","courseAverage":88.92,"maxFail":0},{"courses_dept":"medg","courses_id":"521","courseAverage":88.92,"maxFail":0},{"courses_dept":"math","courses_id":"510","courseAverage":88.93,"maxFail":0},{"courses_dept":"cnps","courses_id":"564","courseAverage":88.96,"maxFail":0},{"courses_dept":"epse","courses_id":"584","courseAverage":88.96,"maxFail":0},{"courses_dept":"germ","courses_id":"521","courseAverage":88.96,"maxFail":0},{"courses_dept":"bmeg","courses_id":"597","courseAverage":88.97,"maxFail":0},{"courses_dept":"etec","courses_id":"540","courseAverage":88.97,"maxFail":0},{"courses_dept":"hgse","courses_id":"350","courseAverage":88.97,"maxFail":0},{"courses_dept":"arst","courses_id":"500","courseAverage":88.98,"maxFail":0},{"courses_dept":"edst","courses_id":"532","courseAverage":88.98,"maxFail":0},{"courses_dept":"fnh","courses_id":"341","courseAverage":88.99,"maxFail":0},{"courses_dept":"dent","courses_id":"596","courseAverage":89,"maxFail":0},{"courses_dept":"math","courses_id":"515","courseAverage":89,"maxFail":0},{"courses_dept":"caps","courses_id":"449","courseAverage":89.01,"maxFail":0},{"courses_dept":"frst","courses_id":"545","courseAverage":89.03,"maxFail":1},{"courses_dept":"fish","courses_id":"508","courseAverage":89.07,"maxFail":0},{"courses_dept":"phar","courses_id":"404","courseAverage":89.08,"maxFail":0},{"courses_dept":"epse","courses_id":"549","courseAverage":89.1,"maxFail":0},{"courses_dept":"pcth","courses_id":"512","courseAverage":89.1,"maxFail":0},{"courses_dept":"spph","courses_id":"540","courseAverage":89.1,"maxFail":0},{"courses_dept":"epse","courses_id":"507","courseAverage":89.11,"maxFail":0},{"courses_dept":"etec","courses_id":"500","courseAverage":89.11,"maxFail":1},{"courses_dept":"nurs","courses_id":"507","courseAverage":89.12,"maxFail":0},{"courses_dept":"epse","courses_id":"586","courseAverage":89.13,"maxFail":0},{"courses_dept":"audi","courses_id":"570","courseAverage":89.15,"maxFail":0},{"courses_dept":"chbe","courses_id":"551","courseAverage":89.16,"maxFail":0},{"courses_dept":"dent","courses_id":"504","courseAverage":89.17,"maxFail":0},{"courses_dept":"eosc","courses_id":"550","courseAverage":89.17,"maxFail":0},{"courses_dept":"kin","courses_id":"595","courseAverage":89.17,"maxFail":0},{"courses_dept":"mech","courses_id":"584","courseAverage":89.17,"maxFail":0},{"courses_dept":"psyc","courses_id":"560","courseAverage":89.17,"maxFail":0},{"courses_dept":"midw","courses_id":"430","courseAverage":89.2,"maxFail":0},{"courses_dept":"lled","courses_id":"602","courseAverage":89.22,"maxFail":0},{"courses_dept":"edcp","courses_id":"377","courseAverage":89.23,"maxFail":0},{"courses_dept":"eosc","courses_id":"531","courseAverage":89.23,"maxFail":0},{"courses_dept":"bioc","courses_id":"509","courseAverage":89.24,"maxFail":0},{"courses_dept":"cell","courses_id":"507","courseAverage":89.24,"maxFail":0},{"courses_dept":"mech","courses_id":"529","courseAverage":89.24,"maxFail":0},{"courses_dept":"stat","courses_id":"540","courseAverage":89.24,"maxFail":0},{"courses_dept":"cnps","courses_id":"514","courseAverage":89.25,"maxFail":0},{"courses_dept":"epse","courses_id":"320","courseAverage":89.25,"maxFail":0},{"courses_dept":"psyc","courses_id":"591","courseAverage":89.25,"maxFail":0},{"courses_dept":"gsat","courses_id":"502","courseAverage":89.26,"maxFail":0},{"courses_dept":"musc","courses_id":"305","courseAverage":89.26,"maxFail":0},{"courses_dept":"math","courses_id":"559","courseAverage":89.27,"maxFail":0},{"courses_dept":"spph","courses_id":"523","courseAverage":89.27,"maxFail":0},{"courses_dept":"audi","courses_id":"551","courseAverage":89.29,"maxFail":0},{"courses_dept":"micb","courses_id":"502","courseAverage":89.29,"maxFail":0},{"courses_dept":"anth","courses_id":"519","courseAverage":89.31,"maxFail":0},{"courses_dept":"math","courses_id":"508","courseAverage":89.31,"maxFail":0},{"courses_dept":"thtr","courses_id":"500","courseAverage":89.32,"maxFail":0},{"courses_dept":"eosc","courses_id":"529","courseAverage":89.33,"maxFail":0},{"courses_dept":"caps","courses_id":"423","courseAverage":89.37,"maxFail":0},{"courses_dept":"edcp","courses_id":"559","courseAverage":89.37,"maxFail":0},{"courses_dept":"zool","courses_id":"503","courseAverage":89.37,"maxFail":0},{"courses_dept":"edcp","courses_id":"508","courseAverage":89.38,"maxFail":0},{"courses_dept":"food","courses_id":"512","courseAverage":89.38,"maxFail":0},{"courses_dept":"eece","courses_id":"541","courseAverage":89.39,"maxFail":0},{"courses_dept":"epse","courses_id":"482","courseAverage":89.4,"maxFail":0},{"courses_dept":"epse","courses_id":"684","courseAverage":89.4,"maxFail":0},{"courses_dept":"epse","courses_id":"437","courseAverage":89.4,"maxFail":1},{"courses_dept":"spph","courses_id":"514","courseAverage":89.41,"maxFail":0},{"courses_dept":"civl","courses_id":"517","courseAverage":89.42,"maxFail":0},{"courses_dept":"arth","courses_id":"599","courseAverage":89.43,"maxFail":0},{"courses_dept":"edst","courses_id":"514","courseAverage":89.43,"maxFail":0},{"courses_dept":"libr","courses_id":"574","courseAverage":89.45,"maxFail":0},{"courses_dept":"plan","courses_id":"517","courseAverage":89.46,"maxFail":0},{"courses_dept":"frst","courses_id":"529","courseAverage":89.5,"maxFail":0},{"courses_dept":"udes","courses_id":"505","courseAverage":89.5,"maxFail":0},{"courses_dept":"kin","courses_id":"367","courseAverage":89.51,"maxFail":1},{"courses_dept":"spph","courses_id":"550","courseAverage":89.56,"maxFail":0},{"courses_dept":"comm","courses_id":"581","courseAverage":89.57,"maxFail":0},{"courses_dept":"epse","courses_id":"415","courseAverage":89.58,"maxFail":0},{"courses_dept":"pcth","courses_id":"549","courseAverage":89.59,"maxFail":0},{"courses_dept":"cell","courses_id":"510","courseAverage":89.6,"maxFail":0},{"courses_dept":"spph","courses_id":"537","courseAverage":89.61,"maxFail":0},{"courses_dept":"eece","courses_id":"554","courseAverage":89.63,"maxFail":0},{"courses_dept":"epse","courses_id":"569","courseAverage":89.66,"maxFail":0},{"courses_dept":"mine","courses_id":"698","courseAverage":89.66,"maxFail":0},{"courses_dept":"edcp","courses_id":"510","courseAverage":89.69,"maxFail":0},{"courses_dept":"chem","courses_id":"534","courseAverage":89.71,"maxFail":0},{"courses_dept":"name","courses_id":"522","courseAverage":89.71,"maxFail":0},{"courses_dept":"nurs","courses_id":"520","courseAverage":89.71,"maxFail":0},{"courses_dept":"cnps","courses_id":"545","courseAverage":89.72,"maxFail":0},{"courses_dept":"etec","courses_id":"530","courseAverage":89.72,"maxFail":1},{"courses_dept":"audi","courses_id":"562","courseAverage":89.73,"maxFail":0},{"courses_dept":"kin","courses_id":"598","courseAverage":89.73,"maxFail":0},{"courses_dept":"econ","courses_id":"495","courseAverage":89.74,"maxFail":0},{"courses_dept":"etec","courses_id":"511","courseAverage":89.76,"maxFail":2},{"courses_dept":"midw","courses_id":"215","courseAverage":89.8,"maxFail":0},{"courses_dept":"audi","courses_id":"577","courseAverage":89.81,"maxFail":0},{"courses_dept":"edcp","courses_id":"562","courseAverage":89.83,"maxFail":0},{"courses_dept":"audi","courses_id":"558","courseAverage":89.85,"maxFail":0},{"courses_dept":"pcth","courses_id":"402","courseAverage":89.86,"maxFail":0},{"courses_dept":"cnps","courses_id":"524","courseAverage":89.89,"maxFail":0},{"courses_dept":"epse","courses_id":"591","courseAverage":89.9,"maxFail":0},{"courses_dept":"econ","courses_id":"640","courseAverage":89.92,"maxFail":0},{"courses_dept":"econ","courses_id":"516","courseAverage":89.96,"maxFail":0},{"courses_dept":"epse","courses_id":"520","courseAverage":89.97,"maxFail":0},{"courses_dept":"chem","courses_id":"407","courseAverage":90,"maxFail":0},{"courses_dept":"dent","courses_id":"724","courseAverage":90,"maxFail":0},{"courses_dept":"sts","courses_id":"597","courseAverage":90,"maxFail":0},{"courses_dept":"econ","courses_id":"580","courseAverage":90.05,"maxFail":0},{"courses_dept":"phil","courses_id":"485","courseAverage":90.06,"maxFail":0},{"courses_dept":"biof","courses_id":"520","courseAverage":90.07,"maxFail":0},{"courses_dept":"eece","courses_id":"534","courseAverage":90.07,"maxFail":0},{"courses_dept":"phys","courses_id":"545","courseAverage":90.08,"maxFail":0},{"courses_dept":"sowk","courses_id":"525","courseAverage":90.13,"maxFail":0},{"courses_dept":"psyc","courses_id":"541","courseAverage":90.17,"maxFail":0},{"courses_dept":"audi","courses_id":"593","courseAverage":90.18,"maxFail":0},{"courses_dept":"pcth","courses_id":"513","courseAverage":90.19,"maxFail":0},{"courses_dept":"phar","courses_id":"408","courseAverage":90.19,"maxFail":0},{"courses_dept":"eosc","courses_id":"526","courseAverage":90.2,"maxFail":0},{"courses_dept":"epse","courses_id":"421","courseAverage":90.2,"maxFail":0},{"courses_dept":"cpsc","courses_id":"501","courseAverage":90.21,"maxFail":0},{"courses_dept":"cnps","courses_id":"504","courseAverage":90.25,"maxFail":0},{"courses_dept":"epse","courses_id":"535","courseAverage":90.26,"maxFail":0},{"courses_dept":"musc","courses_id":"249","courseAverage":90.28,"maxFail":0},{"courses_dept":"etec","courses_id":"532","courseAverage":90.29,"maxFail":0},{"courses_dept":"math","courses_id":"544","courseAverage":90.29,"maxFail":0},{"courses_dept":"sans","courses_id":"200","courseAverage":90.29,"maxFail":0},{"courses_dept":"math","courses_id":"503","courseAverage":90.36,"maxFail":0},{"courses_dept":"epse","courses_id":"432","courseAverage":90.37,"maxFail":0},{"courses_dept":"etec","courses_id":"510","courseAverage":90.37,"maxFail":0},{"courses_dept":"eece","courses_id":"583","courseAverage":90.38,"maxFail":0},{"courses_dept":"epse","courses_id":"528","courseAverage":90.38,"maxFail":0},{"courses_dept":"medi","courses_id":"535","courseAverage":90.4,"maxFail":0},{"courses_dept":"math","courses_id":"589","courseAverage":90.42,"maxFail":0},{"courses_dept":"name","courses_id":"524","courseAverage":90.44,"maxFail":0},{"courses_dept":"mine","courses_id":"553","courseAverage":90.46,"maxFail":1},{"courses_dept":"epse","courses_id":"525","courseAverage":90.5,"maxFail":0},{"courses_dept":"psyc","courses_id":"542","courseAverage":90.51,"maxFail":0},{"courses_dept":"etec","courses_id":"521","courseAverage":90.52,"maxFail":0},{"courses_dept":"biol","courses_id":"449","courseAverage":90.53,"maxFail":0},{"courses_dept":"math","courses_id":"534","courseAverage":90.54,"maxFail":0},{"courses_dept":"eece","courses_id":"531","courseAverage":90.55,"maxFail":0},{"courses_dept":"epse","courses_id":"406","courseAverage":90.55,"maxFail":1},{"courses_dept":"edcp","courses_id":"343","courseAverage":90.57,"maxFail":0},{"courses_dept":"epse","courses_id":"545","courseAverage":90.59,"maxFail":0},{"courses_dept":"musc","courses_id":"563","courseAverage":90.59,"maxFail":0},{"courses_dept":"kin","courses_id":"471","courseAverage":90.7,"maxFail":0},{"courses_dept":"onco","courses_id":"502","courseAverage":90.7,"maxFail":0},{"courses_dept":"soil","courses_id":"510","courseAverage":90.71,"maxFail":0},{"courses_dept":"cpsc","courses_id":"490","courseAverage":90.73,"maxFail":0},{"courses_dept":"math","courses_id":"523","courseAverage":90.73,"maxFail":0},{"courses_dept":"medi","courses_id":"502","courseAverage":90.79,"maxFail":0},{"courses_dept":"nurs","courses_id":"343","courseAverage":90.79,"maxFail":0},{"courses_dept":"edst","courses_id":"520","courseAverage":90.8,"maxFail":0},{"courses_dept":"epse","courses_id":"501","courseAverage":90.82,"maxFail":0},{"courses_dept":"nurs","courses_id":"572","courseAverage":90.86,"maxFail":0},{"courses_dept":"math","courses_id":"551","courseAverage":90.87,"maxFail":0},{"courses_dept":"dent","courses_id":"584","courseAverage":90.88,"maxFail":0},{"courses_dept":"kin","courses_id":"562","courseAverage":90.9,"maxFail":0},{"courses_dept":"epse","courses_id":"529","courseAverage":90.95,"maxFail":0},{"courses_dept":"civl","courses_id":"555","courseAverage":91,"maxFail":0},{"courses_dept":"epse","courses_id":"408","courseAverage":91,"maxFail":1},{"courses_dept":"path","courses_id":"535","courseAverage":91.07,"maxFail":0},{"courses_dept":"psyc","courses_id":"537","courseAverage":91.07,"maxFail":0},{"courses_dept":"epse","courses_id":"449","courseAverage":91.07,"maxFail":1},{"courses_dept":"kin","courses_id":"500","courseAverage":91.08,"maxFail":0},{"courses_dept":"medg","courses_id":"505","courseAverage":91.08,"maxFail":0},{"courses_dept":"phar","courses_id":"457","courseAverage":91.08,"maxFail":0},{"courses_dept":"phth","courses_id":"516","courseAverage":91.08,"maxFail":0},{"courses_dept":"cnps","courses_id":"574","courseAverage":91.11,"maxFail":0},{"courses_dept":"math","courses_id":"516","courseAverage":91.12,"maxFail":0},{"courses_dept":"econ","courses_id":"523","courseAverage":91.15,"maxFail":0},{"courses_dept":"audi","courses_id":"567","courseAverage":91.19,"maxFail":0},{"courses_dept":"edst","courses_id":"570","courseAverage":91.22,"maxFail":0},{"courses_dept":"spph","courses_id":"518","courseAverage":91.24,"maxFail":0},{"courses_dept":"epse","courses_id":"431","courseAverage":91.32,"maxFail":0},{"courses_dept":"phys","courses_id":"508","courseAverage":91.32,"maxFail":0},{"courses_dept":"phar","courses_id":"406","courseAverage":91.33,"maxFail":0},{"courses_dept":"epse","courses_id":"512","courseAverage":91.35,"maxFail":0},{"courses_dept":"epse","courses_id":"502","courseAverage":91.38,"maxFail":0},{"courses_dept":"epse","courses_id":"550","courseAverage":91.4,"maxFail":0},{"courses_dept":"soil","courses_id":"550","courseAverage":91.43,"maxFail":0},{"courses_dept":"epse","courses_id":"531","courseAverage":91.44,"maxFail":0},{"courses_dept":"etec","courses_id":"531","courseAverage":91.45,"maxFail":1},{"courses_dept":"surg","courses_id":"500","courseAverage":91.45,"maxFail":1},{"courses_dept":"edcp","courses_id":"410","courseAverage":91.48,"maxFail":0},{"courses_dept":"cnps","courses_id":"584","courseAverage":91.52,"maxFail":0},{"courses_dept":"epse","courses_id":"303","courseAverage":91.56,"maxFail":0},{"courses_dept":"epse","courses_id":"606","courseAverage":91.57,"maxFail":0},{"courses_dept":"math","courses_id":"525","courseAverage":91.59,"maxFail":0},{"courses_dept":"cell","courses_id":"505","courseAverage":91.64,"maxFail":0},{"courses_dept":"epse","courses_id":"682","courseAverage":91.65,"maxFail":0},{"courses_dept":"edcp","courses_id":"555","courseAverage":91.67,"maxFail":0},{"courses_dept":"hgse","courses_id":"359","courseAverage":91.68,"maxFail":0},{"courses_dept":"nurs","courses_id":"510","courseAverage":91.68,"maxFail":0},{"courses_dept":"bmeg","courses_id":"501","courseAverage":91.7,"maxFail":0},{"courses_dept":"math","courses_id":"546","courseAverage":91.73,"maxFail":0},{"courses_dept":"plan","courses_id":"561","courseAverage":91.75,"maxFail":0},{"courses_dept":"midw","courses_id":"103","courseAverage":91.78,"maxFail":0},{"courses_dept":"plan","courses_id":"595","courseAverage":91.78,"maxFail":0},{"courses_dept":"dent","courses_id":"539","courseAverage":91.82,"maxFail":0},{"courses_dept":"math","courses_id":"502","courseAverage":91.86,"maxFail":0},{"courses_dept":"kin","courses_id":"499","courseAverage":91.87,"maxFail":0},{"courses_dept":"kin","courses_id":"568","courseAverage":91.88,"maxFail":0},{"courses_dept":"epse","courses_id":"312","courseAverage":91.89,"maxFail":1},{"courses_dept":"kin","courses_id":"461","courseAverage":91.94,"maxFail":1},{"courses_dept":"cell","courses_id":"506","courseAverage":91.95,"maxFail":0},{"courses_dept":"musc","courses_id":"559","courseAverage":91.95,"maxFail":0},{"courses_dept":"epse","courses_id":"592","courseAverage":91.96,"maxFail":0},{"courses_dept":"audi","courses_id":"515","courseAverage":91.97,"maxFail":0},{"courses_dept":"civl","courses_id":"508","courseAverage":91.97,"maxFail":0},{"courses_dept":"epse","courses_id":"526","courseAverage":91.99,"maxFail":0},{"courses_dept":"bota","courses_id":"528","courseAverage":92,"maxFail":0},{"courses_dept":"edcp","courses_id":"564","courseAverage":92.04,"maxFail":0},{"courses_dept":"cnps","courses_id":"594","courseAverage":92.08,"maxFail":0},{"courses_dept":"cpsc","courses_id":"449","courseAverage":92.1,"maxFail":0},{"courses_dept":"edcp","courses_id":"568","courseAverage":92.21,"maxFail":0},{"courses_dept":"cnps","courses_id":"586","courseAverage":92.22,"maxFail":0},{"courses_dept":"frst","courses_id":"522","courseAverage":92.22,"maxFail":0},{"courses_dept":"hgse","courses_id":"352","courseAverage":92.25,"maxFail":0},{"courses_dept":"math","courses_id":"532","courseAverage":92.34,"maxFail":0},{"courses_dept":"phth","courses_id":"566","courseAverage":92.34,"maxFail":0},{"courses_dept":"cnps","courses_id":"632","courseAverage":92.35,"maxFail":0},{"courses_dept":"math","courses_id":"545","courseAverage":92.46,"maxFail":0},{"courses_dept":"lled","courses_id":"501","courseAverage":92.5,"maxFail":0},{"courses_dept":"epse","courses_id":"596","courseAverage":92.56,"maxFail":0},{"courses_dept":"epse","courses_id":"534","courseAverage":92.57,"maxFail":0},{"courses_dept":"path","courses_id":"502","courseAverage":92.58,"maxFail":0},{"courses_dept":"crwr","courses_id":"430","courseAverage":92.63,"maxFail":0},{"courses_dept":"math","courses_id":"527","courseAverage":92.72,"maxFail":0},{"courses_dept":"edcp","courses_id":"473","courseAverage":92.78,"maxFail":0},{"courses_dept":"spph","courses_id":"517","courseAverage":92.83,"maxFail":0},{"courses_dept":"epse","courses_id":"553","courseAverage":92.85,"maxFail":0},{"courses_dept":"musc","courses_id":"506","courseAverage":92.9,"maxFail":0},{"courses_dept":"obst","courses_id":"507","courseAverage":93,"maxFail":0},{"courses_dept":"epse","courses_id":"436","courseAverage":93.07,"maxFail":0},{"courses_dept":"epse","courses_id":"683","courseAverage":93.31,"maxFail":0},{"courses_dept":"psyc","courses_id":"501","courseAverage":93.5,"maxFail":0},{"courses_dept":"spph","courses_id":"545","courseAverage":93.63,"maxFail":0},{"courses_dept":"hgse","courses_id":"357","courseAverage":93.65,"maxFail":0},{"courses_dept":"edst","courses_id":"505","courseAverage":93.68,"maxFail":0},{"courses_dept":"midw","courses_id":"101","courseAverage":93.69,"maxFail":0},{"courses_dept":"epse","courses_id":"574","courseAverage":93.76,"maxFail":1},{"courses_dept":"crwr","courses_id":"599","courseAverage":94,"maxFail":0},{"courses_dept":"crwr","courses_id":"530","courseAverage":94.12,"maxFail":0},{"courses_dept":"epse","courses_id":"594","courseAverage":94.3,"maxFail":0},{"courses_dept":"musc","courses_id":"553","courseAverage":94.33,"maxFail":0},{"courses_dept":"audi","courses_id":"568","courseAverage":94.41,"maxFail":0},{"courses_dept":"nurs","courses_id":"591","courseAverage":94.48,"maxFail":0},{"courses_dept":"epse","courses_id":"516","courseAverage":94.52,"maxFail":0},{"courses_dept":"phar","courses_id":"403","courseAverage":94.83,"maxFail":0},{"courses_dept":"kin","courses_id":"565","courseAverage":95.33,"maxFail":0},{"courses_dept":"math","courses_id":"541","courseAverage":95.44,"maxFail":0},{"courses_dept":"nurs","courses_id":"509","courseAverage":95.45,"maxFail":0},{"courses_dept":"nurs","courses_id":"578","courseAverage":95.5,"maxFail":0},{"courses_dept":"mtrl","courses_id":"564","courseAverage":95.63,"maxFail":0}]};
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });

    it("Should be able to query QUERY EXAMPLE 3", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult = {"render":"TABLE","result":[{"courses_dept":"atsc","courses_id":"506","numSections":1},{"courses_dept":"germ","courses_id":"548","numSections":1},{"courses_dept":"phil","courses_id":"599","numSections":1},{"courses_dept":"rhsc","courses_id":"585","numSections":1},{"courses_dept":"span","courses_id":"548","numSections":1},{"courses_dept":"test","courses_id":"100","numSections":1},{"courses_dept":"adhe","courses_id":"328","numSections":2},{"courses_dept":"anat","courses_id":"515","numSections":2},{"courses_dept":"apbi","courses_id":"410","numSections":2},{"courses_dept":"apbi","courses_id":"440","numSections":2},{"courses_dept":"arbc","courses_id":"101","numSections":2},{"courses_dept":"arbc","courses_id":"102","numSections":2},{"courses_dept":"arbc","courses_id":"201","numSections":2},{"courses_dept":"arbc","courses_id":"202","numSections":2},{"courses_dept":"arcl","courses_id":"140","numSections":2},{"courses_dept":"arcl","courses_id":"204","numSections":2},{"courses_dept":"arcl","courses_id":"228","numSections":2},{"courses_dept":"arcl","courses_id":"305","numSections":2},{"courses_dept":"arcl","courses_id":"309","numSections":2},{"courses_dept":"arcl","courses_id":"318","numSections":2},{"courses_dept":"arcl","courses_id":"326","numSections":2},{"courses_dept":"arcl","courses_id":"419","numSections":2},{"courses_dept":"arst","courses_id":"560","numSections":2},{"courses_dept":"arst","courses_id":"600","numSections":2},{"courses_dept":"arth","courses_id":"464","numSections":2},{"courses_dept":"arth","courses_id":"480","numSections":2},{"courses_dept":"asia","courses_id":"305","numSections":2},{"courses_dept":"asia","courses_id":"307","numSections":2},{"courses_dept":"asia","courses_id":"340","numSections":2},{"courses_dept":"asia","courses_id":"341","numSections":2},{"courses_dept":"asia","courses_id":"377","numSections":2},{"courses_dept":"asia","courses_id":"451","numSections":2},{"courses_dept":"asia","courses_id":"498","numSections":2},{"courses_dept":"astr","courses_id":"514","numSections":2},{"courses_dept":"astu","courses_id":"360","numSections":2},{"courses_dept":"atsc","courses_id":"409","numSections":2},{"courses_dept":"audi","courses_id":"527","numSections":2},{"courses_dept":"audi","courses_id":"551","numSections":2},{"courses_dept":"biol","courses_id":"464","numSections":2},{"courses_dept":"bota","courses_id":"526","numSections":2},{"courses_dept":"bota","courses_id":"528","numSections":2},{"courses_dept":"busi","courses_id":"291","numSections":2},{"courses_dept":"caps","courses_id":"200","numSections":2},{"courses_dept":"cell","courses_id":"510","numSections":2},{"courses_dept":"cell","courses_id":"512","numSections":2},{"courses_dept":"cens","courses_id":"307","numSections":2},{"courses_dept":"chbe","courses_id":"486","numSections":2},{"courses_dept":"chem","courses_id":"407","numSections":2},{"courses_dept":"chem","courses_id":"503","numSections":2},{"courses_dept":"chin","courses_id":"461","numSections":2},{"courses_dept":"chin","courses_id":"463","numSections":2},{"courses_dept":"civl","courses_id":"304","numSections":2},{"courses_dept":"civl","courses_id":"404","numSections":2},{"courses_dept":"civl","courses_id":"413","numSections":2},{"courses_dept":"civl","courses_id":"437","numSections":2},{"courses_dept":"civl","courses_id":"447","numSections":2},{"courses_dept":"civl","courses_id":"538","numSections":2},{"courses_dept":"civl","courses_id":"555","numSections":2},{"courses_dept":"civl","courses_id":"556","numSections":2},{"courses_dept":"civl","courses_id":"561","numSections":2},{"courses_dept":"civl","courses_id":"586","numSections":2},{"courses_dept":"clch","courses_id":"389","numSections":2},{"courses_dept":"clch","courses_id":"399","numSections":2},{"courses_dept":"clch","courses_id":"401","numSections":2},{"courses_dept":"clst","courses_id":"331","numSections":2},{"courses_dept":"clst","courses_id":"332","numSections":2},{"courses_dept":"cnrs","courses_id":"449","numSections":2},{"courses_dept":"comm","courses_id":"382","numSections":2},{"courses_dept":"comm","courses_id":"387","numSections":2},{"courses_dept":"comm","courses_id":"389","numSections":2},{"courses_dept":"cpsc","courses_id":"527","numSections":2},{"courses_dept":"cpsc","courses_id":"547","numSections":2},{"courses_dept":"crwr","courses_id":"201","numSections":2},{"courses_dept":"dani","courses_id":"210","numSections":2},{"courses_dept":"dent","courses_id":"513","numSections":2},{"courses_dept":"dent","courses_id":"516","numSections":2},{"courses_dept":"dent","courses_id":"526","numSections":2},{"courses_dept":"dent","courses_id":"528","numSections":2},{"courses_dept":"dent","courses_id":"529","numSections":2},{"courses_dept":"dent","courses_id":"530","numSections":2},{"courses_dept":"dent","courses_id":"533","numSections":2},{"courses_dept":"dent","courses_id":"539","numSections":2},{"courses_dept":"dent","courses_id":"566","numSections":2},{"courses_dept":"dent","courses_id":"568","numSections":2},{"courses_dept":"dent","courses_id":"573","numSections":2},{"courses_dept":"dent","courses_id":"596","numSections":2},{"courses_dept":"dent","courses_id":"724","numSections":2},{"courses_dept":"econ","courses_id":"308","numSections":2},{"courses_dept":"econ","courses_id":"309","numSections":2},{"courses_dept":"econ","courses_id":"327","numSections":2},{"courses_dept":"econ","courses_id":"328","numSections":2},{"courses_dept":"edcp","courses_id":"410","numSections":2},{"courses_dept":"edcp","courses_id":"498","numSections":2},{"courses_dept":"edcp","courses_id":"530","numSections":2},{"courses_dept":"edst","courses_id":"527","numSections":2},{"courses_dept":"educ","courses_id":"172","numSections":2},{"courses_dept":"eece","courses_id":"535","numSections":2},{"courses_dept":"ends","courses_id":"281","numSections":2},{"courses_dept":"eosc","courses_id":"240","numSections":2},{"courses_dept":"eosc","courses_id":"526","numSections":2},{"courses_dept":"eosc","courses_id":"543","numSections":2},{"courses_dept":"eosc","courses_id":"550","numSections":2},{"courses_dept":"eosc","courses_id":"561","numSections":2},{"courses_dept":"eosc","courses_id":"578","numSections":2},{"courses_dept":"eosc","courses_id":"579","numSections":2},{"courses_dept":"epse","courses_id":"171","numSections":2},{"courses_dept":"epse","courses_id":"576","numSections":2},{"courses_dept":"epse","courses_id":"577","numSections":2},{"courses_dept":"fhis","courses_id":"333","numSections":2},{"courses_dept":"fnh","courses_id":"303","numSections":2},{"courses_dept":"fnh","courses_id":"335","numSections":2},{"courses_dept":"fnh","courses_id":"413","numSections":2},{"courses_dept":"fnh","courses_id":"415","numSections":2},{"courses_dept":"fnh","courses_id":"474","numSections":2},{"courses_dept":"food","courses_id":"512","numSections":2},{"courses_dept":"fren","courses_id":"360","numSections":2},{"courses_dept":"fren","courses_id":"499","numSections":2},{"courses_dept":"frst","courses_id":"508","numSections":2},{"courses_dept":"frst","courses_id":"512","numSections":2},{"courses_dept":"frst","courses_id":"522","numSections":2},{"courses_dept":"frst","courses_id":"529","numSections":2},{"courses_dept":"frst","courses_id":"551","numSections":2},{"courses_dept":"frst","courses_id":"590","numSections":2},{"courses_dept":"germ","courses_id":"325","numSections":2},{"courses_dept":"germ","courses_id":"411","numSections":2},{"courses_dept":"grek","courses_id":"101","numSections":2},{"courses_dept":"grek","courses_id":"102","numSections":2},{"courses_dept":"grek","courses_id":"201","numSections":2},{"courses_dept":"grek","courses_id":"202","numSections":2},{"courses_dept":"grek","courses_id":"351","numSections":2},{"courses_dept":"grek","courses_id":"352","numSections":2},{"courses_dept":"grsj","courses_id":"230","numSections":2},{"courses_dept":"grsj","courses_id":"235","numSections":2},{"courses_dept":"hebr","courses_id":"101","numSections":2},{"courses_dept":"hebr","courses_id":"102","numSections":2},{"courses_dept":"hebr","courses_id":"201","numSections":2},{"courses_dept":"hebr","courses_id":"202","numSections":2},{"courses_dept":"hist","courses_id":"101","numSections":2},{"courses_dept":"hist","courses_id":"236","numSections":2},{"courses_dept":"hist","courses_id":"256","numSections":2},{"courses_dept":"hist","courses_id":"259","numSections":2},{"courses_dept":"hist","courses_id":"280","numSections":2},{"courses_dept":"hist","courses_id":"311","numSections":2},{"courses_dept":"hist","courses_id":"358","numSections":2},{"courses_dept":"hist","courses_id":"376","numSections":2},{"courses_dept":"hist","courses_id":"378","numSections":2},{"courses_dept":"hist","courses_id":"392","numSections":2},{"courses_dept":"hist","courses_id":"464","numSections":2},{"courses_dept":"hist","courses_id":"596","numSections":2},{"courses_dept":"isci","courses_id":"311","numSections":2},{"courses_dept":"ital","courses_id":"402","numSections":2},{"courses_dept":"ital","courses_id":"404","numSections":2},{"courses_dept":"ital","courses_id":"408","numSections":2},{"courses_dept":"kin","courses_id":"381","numSections":2},{"courses_dept":"kin","courses_id":"571","numSections":2},{"courses_dept":"korn","courses_id":"301","numSections":2},{"courses_dept":"korn","courses_id":"302","numSections":2},{"courses_dept":"latn","courses_id":"350","numSections":2},{"courses_dept":"latn","courses_id":"351","numSections":2},{"courses_dept":"law","courses_id":"352","numSections":2},{"courses_dept":"law","courses_id":"400","numSections":2},{"courses_dept":"law","courses_id":"409","numSections":2},{"courses_dept":"law","courses_id":"412","numSections":2},{"courses_dept":"law","courses_id":"416","numSections":2},{"courses_dept":"law","courses_id":"464","numSections":2},{"courses_dept":"law","courses_id":"504","numSections":2},{"courses_dept":"law","courses_id":"506","numSections":2},{"courses_dept":"law","courses_id":"562","numSections":2},{"courses_dept":"law","courses_id":"563","numSections":2},{"courses_dept":"law","courses_id":"564","numSections":2},{"courses_dept":"law","courses_id":"565","numSections":2},{"courses_dept":"law","courses_id":"566","numSections":2},{"courses_dept":"law","courses_id":"567","numSections":2},{"courses_dept":"libr","courses_id":"531","numSections":2},{"courses_dept":"libr","courses_id":"532","numSections":2},{"courses_dept":"libr","courses_id":"574","numSections":2},{"courses_dept":"ling","courses_id":"333","numSections":2},{"courses_dept":"ling","courses_id":"345","numSections":2},{"courses_dept":"ling","courses_id":"449","numSections":2},{"courses_dept":"lled","courses_id":"501","numSections":2},{"courses_dept":"math","courses_id":"546","numSections":2},{"courses_dept":"math","courses_id":"559","numSections":2},{"courses_dept":"math","courses_id":"562","numSections":2},{"courses_dept":"mdvl","courses_id":"210","numSections":2},{"courses_dept":"mech","courses_id":"226","numSections":2},{"courses_dept":"mech","courses_id":"439","numSections":2},{"courses_dept":"mech","courses_id":"460","numSections":2},{"courses_dept":"mech","courses_id":"543","numSections":2},{"courses_dept":"mech","courses_id":"552","numSections":2},{"courses_dept":"medi","courses_id":"535","numSections":2},{"courses_dept":"mine","courses_id":"350","numSections":2},{"courses_dept":"mine","courses_id":"438","numSections":2},{"courses_dept":"mtrl","courses_id":"559","numSections":2},{"courses_dept":"mtrl","courses_id":"562","numSections":2},{"courses_dept":"musc","courses_id":"354","numSections":2},{"courses_dept":"musc","courses_id":"358","numSections":2},{"courses_dept":"nurs","courses_id":"344","numSections":2},{"courses_dept":"obst","courses_id":"503","numSections":2},{"courses_dept":"obst","courses_id":"507","numSections":2},{"courses_dept":"path","courses_id":"501","numSections":2},{"courses_dept":"path","courses_id":"502","numSections":2},{"courses_dept":"pers","courses_id":"200","numSections":2},{"courses_dept":"pers","courses_id":"201","numSections":2},{"courses_dept":"phar","courses_id":"409","numSections":2},{"courses_dept":"phar","courses_id":"525","numSections":2},{"courses_dept":"phar","courses_id":"526","numSections":2},{"courses_dept":"phar","courses_id":"543","numSections":2},{"courses_dept":"phil","courses_id":"388","numSections":2},{"courses_dept":"phil","courses_id":"585","numSections":2},{"courses_dept":"phth","courses_id":"517","numSections":2},{"courses_dept":"phth","courses_id":"527","numSections":2},{"courses_dept":"phys","courses_id":"560","numSections":2},{"courses_dept":"port","courses_id":"301","numSections":2},{"courses_dept":"psyc","courses_id":"523","numSections":2},{"courses_dept":"relg","courses_id":"101","numSections":2},{"courses_dept":"relg","courses_id":"209","numSections":2},{"courses_dept":"relg","courses_id":"316","numSections":2},{"courses_dept":"relg","courses_id":"317","numSections":2},{"courses_dept":"rmes","courses_id":"530","numSections":2},{"courses_dept":"russ","courses_id":"316","numSections":2},{"courses_dept":"sans","courses_id":"200","numSections":2},{"courses_dept":"soil","courses_id":"502","numSections":2},{"courses_dept":"soil","courses_id":"510","numSections":2},{"courses_dept":"soil","courses_id":"550","numSections":2},{"courses_dept":"sowk","courses_id":"516","numSections":2},{"courses_dept":"span","courses_id":"280","numSections":2},{"courses_dept":"span","courses_id":"495","numSections":2},{"courses_dept":"spph","courses_id":"517","numSections":2},{"courses_dept":"spph","courses_id":"521","numSections":2},{"courses_dept":"spph","courses_id":"543","numSections":2},{"courses_dept":"spph","courses_id":"550","numSections":2},{"courses_dept":"stat","courses_id":"357","numSections":2},{"courses_dept":"stat","courses_id":"406","numSections":2},{"courses_dept":"sts","courses_id":"502","numSections":2},{"courses_dept":"sts","courses_id":"597","numSections":2},{"courses_dept":"surg","courses_id":"514","numSections":2},{"courses_dept":"thtr","courses_id":"250","numSections":2},{"courses_dept":"thtr","courses_id":"450","numSections":2},{"courses_dept":"thtr","courses_id":"506","numSections":2},{"courses_dept":"thtr","courses_id":"520","numSections":2},{"courses_dept":"udes","courses_id":"501","numSections":2},{"courses_dept":"udes","courses_id":"502","numSections":2},{"courses_dept":"udes","courses_id":"504","numSections":2},{"courses_dept":"udes","courses_id":"505","numSections":2},{"courses_dept":"visa","courses_id":"352","numSections":2},{"courses_dept":"wood","courses_id":"241","numSections":2},{"courses_dept":"wood","courses_id":"249","numSections":2},{"courses_dept":"wood","courses_id":"276","numSections":2},{"courses_dept":"wood","courses_id":"356","numSections":2},{"courses_dept":"wood","courses_id":"384","numSections":2},{"courses_dept":"wood","courses_id":"476","numSections":2},{"courses_dept":"wood","courses_id":"482","numSections":2},{"courses_dept":"wood","courses_id":"499","numSections":2},{"courses_dept":"arcl","courses_id":"103","numSections":3},{"courses_dept":"civl","courses_id":"305","numSections":3},{"courses_dept":"crwr","courses_id":"205","numSections":3},{"courses_dept":"iar","courses_id":"520","numSections":3},{"courses_dept":"latn","courses_id":"201","numSections":3},{"courses_dept":"latn","courses_id":"202","numSections":3},{"courses_dept":"law","courses_id":"300","numSections":3},{"courses_dept":"law","courses_id":"359","numSections":3},{"courses_dept":"law","courses_id":"407","numSections":3},{"courses_dept":"phar","courses_id":"403","numSections":3},{"courses_dept":"phar","courses_id":"457","numSections":3},{"courses_dept":"phil","courses_id":"150","numSections":3},{"courses_dept":"span","courses_id":"549","numSections":3},{"courses_dept":"wood","courses_id":"225","numSections":3},{"courses_dept":"anth","courses_id":"451","numSections":4},{"courses_dept":"anth","courses_id":"528","numSections":4},{"courses_dept":"apbi","courses_id":"265","numSections":4},{"courses_dept":"apbi","courses_id":"414","numSections":4},{"courses_dept":"apbi","courses_id":"415","numSections":4},{"courses_dept":"apbi","courses_id":"417","numSections":4},{"courses_dept":"arch","courses_id":"539","numSections":4},{"courses_dept":"arst","courses_id":"565","numSections":4},{"courses_dept":"arst","courses_id":"580","numSections":4},{"courses_dept":"arth","courses_id":"343","numSections":4},{"courses_dept":"arth","courses_id":"361","numSections":4},{"courses_dept":"asia","courses_id":"326","numSections":4},{"courses_dept":"asia","courses_id":"332","numSections":4},{"courses_dept":"asia","courses_id":"351","numSections":4},{"courses_dept":"asia","courses_id":"365","numSections":4},{"courses_dept":"asia","courses_id":"370","numSections":4},{"courses_dept":"asia","courses_id":"385","numSections":4},{"courses_dept":"asia","courses_id":"386","numSections":4},{"courses_dept":"asia","courses_id":"396","numSections":4},{"courses_dept":"asia","courses_id":"410","numSections":4},{"courses_dept":"asia","courses_id":"457","numSections":4},{"courses_dept":"astr","courses_id":"200","numSections":4},{"courses_dept":"astr","courses_id":"205","numSections":4},{"courses_dept":"astr","courses_id":"300","numSections":4},{"courses_dept":"astr","courses_id":"333","numSections":4},{"courses_dept":"astr","courses_id":"406","numSections":4},{"courses_dept":"astr","courses_id":"407","numSections":4},{"courses_dept":"astu","courses_id":"211","numSections":4},{"courses_dept":"baen","courses_id":"510","numSections":4},{"courses_dept":"basm","courses_id":"523","numSections":4},{"courses_dept":"biof","courses_id":"540","numSections":4},{"courses_dept":"biol","courses_id":"203","numSections":4},{"courses_dept":"biol","courses_id":"420","numSections":4},{"courses_dept":"biol","courses_id":"428","numSections":4},{"courses_dept":"biol","courses_id":"438","numSections":4},{"courses_dept":"biol","courses_id":"446","numSections":4},{"courses_dept":"biol","courses_id":"459","numSections":4},{"courses_dept":"bmeg","courses_id":"510","numSections":4},{"courses_dept":"caps","courses_id":"303","numSections":4},{"courses_dept":"caps","courses_id":"421","numSections":4},{"courses_dept":"caps","courses_id":"422","numSections":4},{"courses_dept":"caps","courses_id":"423","numSections":4},{"courses_dept":"caps","courses_id":"424","numSections":4},{"courses_dept":"caps","courses_id":"426","numSections":4},{"courses_dept":"caps","courses_id":"430","numSections":4},{"courses_dept":"caps","courses_id":"449","numSections":4},{"courses_dept":"chbe","courses_id":"402","numSections":4},{"courses_dept":"chbe","courses_id":"492","numSections":4},{"courses_dept":"chbe","courses_id":"493","numSections":4},{"courses_dept":"chbe","courses_id":"494","numSections":4},{"courses_dept":"chbe","courses_id":"561","numSections":4},{"courses_dept":"chem","courses_id":"401","numSections":4},{"courses_dept":"chem","courses_id":"403","numSections":4},{"courses_dept":"chem","courses_id":"405","numSections":4},{"courses_dept":"civl","courses_id":"300","numSections":4},{"courses_dept":"civl","courses_id":"409","numSections":4},{"courses_dept":"civl","courses_id":"426","numSections":4},{"courses_dept":"civl","courses_id":"509","numSections":4},{"courses_dept":"clst","courses_id":"111","numSections":4},{"courses_dept":"cohr","courses_id":"408","numSections":4},{"courses_dept":"comm","courses_id":"634","numSections":4},{"courses_dept":"comm","courses_id":"657","numSections":4},{"courses_dept":"cpsc","courses_id":"418","numSections":4},{"courses_dept":"cpsc","courses_id":"515","numSections":4},{"courses_dept":"dani","courses_id":"100","numSections":4},{"courses_dept":"dani","courses_id":"110","numSections":4},{"courses_dept":"dani","courses_id":"200","numSections":4},{"courses_dept":"dent","courses_id":"542","numSections":4},{"courses_dept":"dent","courses_id":"565","numSections":4},{"courses_dept":"dent","courses_id":"567","numSections":4},{"courses_dept":"dent","courses_id":"572","numSections":4},{"courses_dept":"dent","courses_id":"584","numSections":4},{"courses_dept":"dent","courses_id":"592","numSections":4},{"courses_dept":"dent","courses_id":"595","numSections":4},{"courses_dept":"dent","courses_id":"721","numSections":4},{"courses_dept":"dent","courses_id":"722","numSections":4},{"courses_dept":"dhyg","courses_id":"325","numSections":4},{"courses_dept":"econ","courses_id":"482","numSections":4},{"courses_dept":"econ","courses_id":"523","numSections":4},{"courses_dept":"edcp","courses_id":"473","numSections":4},{"courses_dept":"edcp","courses_id":"537","numSections":4},{"courses_dept":"edcp","courses_id":"553","numSections":4},{"courses_dept":"edcp","courses_id":"555","numSections":4},{"courses_dept":"edcp","courses_id":"568","numSections":4},{"courses_dept":"educ","courses_id":"211","numSections":4},{"courses_dept":"eece","courses_id":"512","numSections":4},{"courses_dept":"eece","courses_id":"513","numSections":4},{"courses_dept":"engl","courses_id":"231","numSections":4},{"courses_dept":"enph","courses_id":"481","numSections":4},{"courses_dept":"envr","courses_id":"420","numSections":4},{"courses_dept":"eosc","courses_id":"522","numSections":4},{"courses_dept":"eosc","courses_id":"538","numSections":4},{"courses_dept":"eosc","courses_id":"562","numSections":4},{"courses_dept":"eosc","courses_id":"575","numSections":4},{"courses_dept":"epse","courses_id":"502","numSections":4},{"courses_dept":"epse","courses_id":"586","numSections":4},{"courses_dept":"epse","courses_id":"594","numSections":4},{"courses_dept":"epse","courses_id":"682","numSections":4},{"courses_dept":"epse","courses_id":"684","numSections":4},{"courses_dept":"fish","courses_id":"508","numSections":4},{"courses_dept":"fist","courses_id":"230","numSections":4},{"courses_dept":"fist","courses_id":"338","numSections":4},{"courses_dept":"fnh","courses_id":"460","numSections":4},{"courses_dept":"fnh","courses_id":"499","numSections":4},{"courses_dept":"fre","courses_id":"460","numSections":4},{"courses_dept":"fre","courses_id":"516","numSections":4},{"courses_dept":"fre","courses_id":"585","numSections":4},{"courses_dept":"frst","courses_id":"202","numSections":4},{"courses_dept":"frst","courses_id":"309","numSections":4},{"courses_dept":"frst","courses_id":"310","numSections":4},{"courses_dept":"frst","courses_id":"408","numSections":4},{"courses_dept":"frst","courses_id":"421","numSections":4},{"courses_dept":"frst","courses_id":"490","numSections":4},{"courses_dept":"frst","courses_id":"516","numSections":4},{"courses_dept":"frst","courses_id":"530","numSections":4},{"courses_dept":"frst","courses_id":"576","numSections":4},{"courses_dept":"germ","courses_id":"521","numSections":4},{"courses_dept":"grsj","courses_id":"301","numSections":4},{"courses_dept":"grsj","courses_id":"303","numSections":4},{"courses_dept":"grsj","courses_id":"305","numSections":4},{"courses_dept":"grsj","courses_id":"306","numSections":4},{"courses_dept":"grsj","courses_id":"307","numSections":4},{"courses_dept":"grsj","courses_id":"310","numSections":4},{"courses_dept":"grsj","courses_id":"311","numSections":4},{"courses_dept":"grsj","courses_id":"320","numSections":4},{"courses_dept":"grsj","courses_id":"325","numSections":4},{"courses_dept":"grsj","courses_id":"326","numSections":4},{"courses_dept":"grsj","courses_id":"327","numSections":4},{"courses_dept":"grsj","courses_id":"328","numSections":4},{"courses_dept":"grsj","courses_id":"401","numSections":4},{"courses_dept":"grsj","courses_id":"422","numSections":4},{"courses_dept":"grsj","courses_id":"500","numSections":4},{"courses_dept":"grsj","courses_id":"501","numSections":4},{"courses_dept":"grsj","courses_id":"502","numSections":4},{"courses_dept":"gsat","courses_id":"540","numSections":4},{"courses_dept":"hgse","courses_id":"350","numSections":4},{"courses_dept":"hgse","courses_id":"351","numSections":4},{"courses_dept":"hgse","courses_id":"352","numSections":4},{"courses_dept":"hgse","courses_id":"353","numSections":4},{"courses_dept":"hgse","courses_id":"354","numSections":4},{"courses_dept":"hgse","courses_id":"355","numSections":4},{"courses_dept":"hgse","courses_id":"356","numSections":4},{"courses_dept":"hgse","courses_id":"357","numSections":4},{"courses_dept":"hgse","courses_id":"358","numSections":4},{"courses_dept":"hgse","courses_id":"359","numSections":4},{"courses_dept":"hist","courses_id":"315","numSections":4},{"courses_dept":"hist","courses_id":"356","numSections":4},{"courses_dept":"hist","courses_id":"382","numSections":4},{"courses_dept":"hist","courses_id":"391","numSections":4},{"courses_dept":"hist","courses_id":"394","numSections":4},{"courses_dept":"hist","courses_id":"419","numSections":4},{"courses_dept":"hist","courses_id":"560","numSections":4},{"courses_dept":"hist","courses_id":"561","numSections":4},{"courses_dept":"igen","courses_id":"340","numSections":4},{"courses_dept":"isci","courses_id":"422","numSections":4},{"courses_dept":"ital","courses_id":"401","numSections":4},{"courses_dept":"ital","courses_id":"409","numSections":4},{"courses_dept":"ital","courses_id":"430","numSections":4},{"courses_dept":"itst","courses_id":"333","numSections":4},{"courses_dept":"itst","courses_id":"345","numSections":4},{"courses_dept":"kin","courses_id":"362","numSections":4},{"courses_dept":"kin","courses_id":"465","numSections":4},{"courses_dept":"kin","courses_id":"568","numSections":4},{"courses_dept":"larc","courses_id":"523","numSections":4},{"courses_dept":"law","courses_id":"336","numSections":4},{"courses_dept":"law","courses_id":"436","numSections":4},{"courses_dept":"law","courses_id":"469","numSections":4},{"courses_dept":"libr","courses_id":"533","numSections":4},{"courses_dept":"lled","courses_id":"552","numSections":4},{"courses_dept":"math","courses_id":"310","numSections":4},{"courses_dept":"math","courses_id":"313","numSections":4},{"courses_dept":"math","courses_id":"427","numSections":4},{"courses_dept":"math","courses_id":"444","numSections":4},{"courses_dept":"math","courses_id":"515","numSections":4},{"courses_dept":"math","courses_id":"523","numSections":4},{"courses_dept":"math","courses_id":"541","numSections":4},{"courses_dept":"math","courses_id":"551","numSections":4},{"courses_dept":"mech","courses_id":"454","numSections":4},{"courses_dept":"mech","courses_id":"469","numSections":4},{"courses_dept":"mech","courses_id":"470","numSections":4},{"courses_dept":"mech","courses_id":"478","numSections":4},{"courses_dept":"mech","courses_id":"488","numSections":4},{"courses_dept":"mech","courses_id":"493","numSections":4},{"courses_dept":"mech","courses_id":"589","numSections":4},{"courses_dept":"mech","courses_id":"596","numSections":4},{"courses_dept":"mtrl","courses_id":"201","numSections":4},{"courses_dept":"mtrl","courses_id":"564","numSections":4},{"courses_dept":"mtrl","courses_id":"578","numSections":4},{"courses_dept":"mtrl","courses_id":"579","numSections":4},{"courses_dept":"mtrl","courses_id":"582","numSections":4},{"courses_dept":"musc","courses_id":"410","numSections":4},{"courses_dept":"musc","courses_id":"506","numSections":4},{"courses_dept":"musc","courses_id":"559","numSections":4},{"courses_dept":"name","courses_id":"501","numSections":4},{"courses_dept":"name","courses_id":"502","numSections":4},{"courses_dept":"name","courses_id":"522","numSections":4},{"courses_dept":"name","courses_id":"524","numSections":4},{"courses_dept":"name","courses_id":"566","numSections":4},{"courses_dept":"name","courses_id":"578","numSections":4},{"courses_dept":"name","courses_id":"591","numSections":4},{"courses_dept":"path","courses_id":"531","numSections":4},{"courses_dept":"pcth","courses_id":"201","numSections":4},{"courses_dept":"pers","courses_id":"300","numSections":4},{"courses_dept":"phar","courses_id":"404","numSections":4},{"courses_dept":"phar","courses_id":"515","numSections":4},{"courses_dept":"phar","courses_id":"518","numSections":4},{"courses_dept":"phil","courses_id":"364","numSections":4},{"courses_dept":"phil","courses_id":"485","numSections":4},{"courses_dept":"phil","courses_id":"487","numSections":4},{"courses_dept":"phth","courses_id":"545","numSections":4},{"courses_dept":"phys","courses_id":"158","numSections":4},{"courses_dept":"phys","courses_id":"219","numSections":4},{"courses_dept":"phys","courses_id":"229","numSections":4},{"courses_dept":"phys","courses_id":"318","numSections":4},{"courses_dept":"phys","courses_id":"349","numSections":4},{"courses_dept":"phys","courses_id":"438","numSections":4},{"courses_dept":"phys","courses_id":"505","numSections":4},{"courses_dept":"phys","courses_id":"535","numSections":4},{"courses_dept":"phys","courses_id":"572","numSections":4},{"courses_dept":"poli","courses_id":"334","numSections":4},{"courses_dept":"pols","courses_id":"300","numSections":4},{"courses_dept":"psyc","courses_id":"404","numSections":4},{"courses_dept":"psyc","courses_id":"508","numSections":4},{"courses_dept":"psyc","courses_id":"591","numSections":4},{"courses_dept":"punj","courses_id":"100","numSections":4},{"courses_dept":"relg","courses_id":"305","numSections":4},{"courses_dept":"relg","courses_id":"308","numSections":4},{"courses_dept":"relg","courses_id":"309","numSections":4},{"courses_dept":"relg","courses_id":"415","numSections":4},{"courses_dept":"rmes","courses_id":"507","numSections":4},{"courses_dept":"rmes","courses_id":"516","numSections":4},{"courses_dept":"rmes","courses_id":"517","numSections":4},{"courses_dept":"rmst","courses_id":"234","numSections":4},{"courses_dept":"russ","courses_id":"412","numSections":4},{"courses_dept":"sans","courses_id":"100","numSections":4},{"courses_dept":"scan","courses_id":"335","numSections":4},{"courses_dept":"scan","courses_id":"336","numSections":4},{"courses_dept":"soci","courses_id":"324","numSections":4},{"courses_dept":"soil","courses_id":"503","numSections":4},{"courses_dept":"soil","courses_id":"516","numSections":4},{"courses_dept":"span","courses_id":"222","numSections":4},{"courses_dept":"span","courses_id":"410","numSections":4},{"courses_dept":"spph","courses_id":"514","numSections":4},{"courses_dept":"spph","courses_id":"530","numSections":4},{"courses_dept":"spph","courses_id":"565","numSections":4},{"courses_dept":"swed","courses_id":"110","numSections":4},{"courses_dept":"swed","courses_id":"200","numSections":4},{"courses_dept":"swed","courses_id":"210","numSections":4},{"courses_dept":"thtr","courses_id":"407","numSections":4},{"courses_dept":"thtr","courses_id":"452","numSections":4},{"courses_dept":"wood","courses_id":"475","numSections":4},{"courses_dept":"crwr","courses_id":"230","numSections":5},{"courses_dept":"epse","courses_id":"574","numSections":5},{"courses_dept":"latn","courses_id":"102","numSections":5},{"courses_dept":"law","courses_id":"201","numSections":5},{"courses_dept":"law","courses_id":"211","numSections":5},{"courses_dept":"law","courses_id":"221","numSections":5},{"courses_dept":"law","courses_id":"231","numSections":5},{"courses_dept":"law","courses_id":"241","numSections":5},{"courses_dept":"law","courses_id":"251","numSections":5},{"courses_dept":"law","courses_id":"261","numSections":5},{"courses_dept":"law","courses_id":"281","numSections":5},{"courses_dept":"law","courses_id":"476","numSections":5},{"courses_dept":"law","courses_id":"507","numSections":5},{"courses_dept":"lfs","courses_id":"150","numSections":5},{"courses_dept":"lled","courses_id":"557","numSections":5},{"courses_dept":"poli","courses_id":"345","numSections":5},{"courses_dept":"anat","courses_id":"511","numSections":6},{"courses_dept":"anth","courses_id":"213","numSections":6},{"courses_dept":"anth","courses_id":"301","numSections":6},{"courses_dept":"anth","courses_id":"312","numSections":6},{"courses_dept":"anth","courses_id":"519","numSections":6},{"courses_dept":"anth","courses_id":"541","numSections":6},{"courses_dept":"apbi","courses_id":"316","numSections":6},{"courses_dept":"apbi","courses_id":"403","numSections":6},{"courses_dept":"arth","courses_id":"346","numSections":6},{"courses_dept":"arth","courses_id":"432","numSections":6},{"courses_dept":"arth","courses_id":"439","numSections":6},{"courses_dept":"asia","courses_id":"300","numSections":6},{"courses_dept":"asia","courses_id":"369","numSections":6},{"courses_dept":"asia","courses_id":"372","numSections":6},{"courses_dept":"asia","courses_id":"378","numSections":6},{"courses_dept":"asia","courses_id":"387","numSections":6},{"courses_dept":"asia","courses_id":"453","numSections":6},{"courses_dept":"astr","courses_id":"502","numSections":6},{"courses_dept":"astu","courses_id":"210","numSections":6},{"courses_dept":"atsc","courses_id":"212","numSections":6},{"courses_dept":"atsc","courses_id":"404","numSections":6},{"courses_dept":"atsc","courses_id":"405","numSections":6},{"courses_dept":"atsc","courses_id":"500","numSections":6},{"courses_dept":"audi","courses_id":"570","numSections":6},{"courses_dept":"basc","courses_id":"524","numSections":6},{"courses_dept":"bioc","courses_id":"203","numSections":6},{"courses_dept":"bioc","courses_id":"304","numSections":6},{"courses_dept":"bioc","courses_id":"440","numSections":6},{"courses_dept":"bioc","courses_id":"450","numSections":6},{"courses_dept":"bioc","courses_id":"509","numSections":6},{"courses_dept":"bioc","courses_id":"514","numSections":6},{"courses_dept":"biol","courses_id":"411","numSections":6},{"courses_dept":"biol","courses_id":"501","numSections":6},{"courses_dept":"biol","courses_id":"535","numSections":6},{"courses_dept":"bmeg","courses_id":"410","numSections":6},{"courses_dept":"bmeg","courses_id":"500","numSections":6},{"courses_dept":"bmeg","courses_id":"501","numSections":6},{"courses_dept":"bmeg","courses_id":"597","numSections":6},{"courses_dept":"bota","courses_id":"544","numSections":6},{"courses_dept":"busi","courses_id":"465","numSections":6},{"courses_dept":"ccst","courses_id":"502","numSections":6},{"courses_dept":"cell","courses_id":"508","numSections":6},{"courses_dept":"cell","courses_id":"509","numSections":6},{"courses_dept":"cens","courses_id":"404","numSections":6},{"courses_dept":"chbe","courses_id":"419","numSections":6},{"courses_dept":"chbe","courses_id":"491","numSections":6},{"courses_dept":"chbe","courses_id":"495","numSections":6},{"courses_dept":"chbe","courses_id":"496","numSections":6},{"courses_dept":"chbe","courses_id":"563","numSections":6},{"courses_dept":"chbe","courses_id":"564","numSections":6},{"courses_dept":"chem","courses_id":"502","numSections":6},{"courses_dept":"civl","courses_id":"508","numSections":6},{"courses_dept":"civl","courses_id":"517","numSections":6},{"courses_dept":"clst","courses_id":"110","numSections":6},{"courses_dept":"clst","courses_id":"260","numSections":6},{"courses_dept":"clst","courses_id":"311","numSections":6},{"courses_dept":"clst","courses_id":"312","numSections":6},{"courses_dept":"clst","courses_id":"317","numSections":6},{"courses_dept":"clst","courses_id":"318","numSections":6},{"courses_dept":"clst","courses_id":"334","numSections":6},{"courses_dept":"clst","courses_id":"353","numSections":6},{"courses_dept":"clst","courses_id":"502","numSections":6},{"courses_dept":"cnrs","courses_id":"500","numSections":6},{"courses_dept":"cohr","courses_id":"301","numSections":6},{"courses_dept":"comm","courses_id":"280","numSections":6},{"courses_dept":"comm","courses_id":"487","numSections":6},{"courses_dept":"comm","courses_id":"662","numSections":6},{"courses_dept":"comm","courses_id":"672","numSections":6},{"courses_dept":"comm","courses_id":"695","numSections":6},{"courses_dept":"cpsc","courses_id":"261","numSections":6},{"courses_dept":"cpsc","courses_id":"503","numSections":6},{"courses_dept":"cpsc","courses_id":"507","numSections":6},{"courses_dept":"cpsc","courses_id":"522","numSections":6},{"courses_dept":"crwr","courses_id":"209","numSections":6},{"courses_dept":"crwr","courses_id":"430","numSections":6},{"courses_dept":"crwr","courses_id":"530","numSections":6},{"courses_dept":"dent","courses_id":"505","numSections":6},{"courses_dept":"dent","courses_id":"525","numSections":6},{"courses_dept":"dent","courses_id":"527","numSections":6},{"courses_dept":"dent","courses_id":"531","numSections":6},{"courses_dept":"dent","courses_id":"532","numSections":6},{"courses_dept":"dent","courses_id":"544","numSections":6},{"courses_dept":"dent","courses_id":"555","numSections":6},{"courses_dept":"dent","courses_id":"570","numSections":6},{"courses_dept":"dent","courses_id":"578","numSections":6},{"courses_dept":"dent","courses_id":"591","numSections":6},{"courses_dept":"dent","courses_id":"594","numSections":6},{"courses_dept":"dhyg","courses_id":"106","numSections":6},{"courses_dept":"econ","courses_id":"350","numSections":6},{"courses_dept":"econ","courses_id":"390","numSections":6},{"courses_dept":"econ","courses_id":"544","numSections":6},{"courses_dept":"edcp","courses_id":"343","numSections":6},{"courses_dept":"edcp","courses_id":"551","numSections":6},{"courses_dept":"edcp","courses_id":"559","numSections":6},{"courses_dept":"edst","courses_id":"511","numSections":6},{"courses_dept":"edst","courses_id":"571","numSections":6},{"courses_dept":"edst","courses_id":"588","numSections":6},{"courses_dept":"educ","courses_id":"210","numSections":6},{"courses_dept":"eece","courses_id":"518","numSections":6},{"courses_dept":"eece","courses_id":"528","numSections":6},{"courses_dept":"eece","courses_id":"531","numSections":6},{"courses_dept":"eece","courses_id":"534","numSections":6},{"courses_dept":"eece","courses_id":"550","numSections":6},{"courses_dept":"eece","courses_id":"554","numSections":6},{"courses_dept":"envr","courses_id":"449","numSections":6},{"courses_dept":"eosc","courses_id":"424","numSections":6},{"courses_dept":"eosc","courses_id":"430","numSections":6},{"courses_dept":"eosc","courses_id":"432","numSections":6},{"courses_dept":"eosc","courses_id":"511","numSections":6},{"courses_dept":"eosc","courses_id":"514","numSections":6},{"courses_dept":"eosc","courses_id":"520","numSections":6},{"courses_dept":"eosc","courses_id":"529","numSections":6},{"courses_dept":"eosc","courses_id":"540","numSections":6},{"courses_dept":"eosc","courses_id":"573","numSections":6},{"courses_dept":"epse","courses_id":"415","numSections":6},{"courses_dept":"epse","courses_id":"519","numSections":6},{"courses_dept":"epse","courses_id":"520","numSections":6},{"courses_dept":"epse","courses_id":"525","numSections":6},{"courses_dept":"epse","courses_id":"529","numSections":6},{"courses_dept":"epse","courses_id":"545","numSections":6},{"courses_dept":"epse","courses_id":"575","numSections":6},{"courses_dept":"epse","courses_id":"683","numSections":6},{"courses_dept":"fipr","courses_id":"230","numSections":6},{"courses_dept":"fipr","courses_id":"330","numSections":6},{"courses_dept":"fish","courses_id":"504","numSections":6},{"courses_dept":"fist","courses_id":"240","numSections":6},{"courses_dept":"food","courses_id":"515","numSections":6},{"courses_dept":"fopr","courses_id":"261","numSections":6},{"courses_dept":"fre","courses_id":"501","numSections":6},{"courses_dept":"fre","courses_id":"502","numSections":6},{"courses_dept":"fre","courses_id":"547","numSections":6},{"courses_dept":"fren","courses_id":"329","numSections":6},{"courses_dept":"fren","courses_id":"334","numSections":6},{"courses_dept":"fren","courses_id":"371","numSections":6},{"courses_dept":"frst","courses_id":"524","numSections":6},{"courses_dept":"frst","courses_id":"556","numSections":6},{"courses_dept":"frst","courses_id":"557","numSections":6},{"courses_dept":"frst","courses_id":"558","numSections":6},{"courses_dept":"geob","courses_id":"406","numSections":6},{"courses_dept":"geob","courses_id":"409","numSections":6},{"courses_dept":"geob","courses_id":"472","numSections":6},{"courses_dept":"geob","courses_id":"501","numSections":6},{"courses_dept":"geog","courses_id":"211","numSections":6},{"courses_dept":"geog","courses_id":"220","numSections":6},{"courses_dept":"geog","courses_id":"311","numSections":6},{"courses_dept":"geog","courses_id":"485","numSections":6},{"courses_dept":"geog","courses_id":"535","numSections":6},{"courses_dept":"germ","courses_id":"360","numSections":6},{"courses_dept":"germ","courses_id":"380","numSections":6},{"courses_dept":"germ","courses_id":"402","numSections":6},{"courses_dept":"grsj","courses_id":"102","numSections":6},{"courses_dept":"hist","courses_id":"455","numSections":6},{"courses_dept":"hunu","courses_id":"505","numSections":6},{"courses_dept":"ital","courses_id":"303","numSections":6},{"courses_dept":"itst","courses_id":"234","numSections":6},{"courses_dept":"kin","courses_id":"261","numSections":6},{"courses_dept":"kin","courses_id":"284","numSections":6},{"courses_dept":"kin","courses_id":"343","numSections":6},{"courses_dept":"kin","courses_id":"360","numSections":6},{"courses_dept":"kin","courses_id":"366","numSections":6},{"courses_dept":"kin","courses_id":"367","numSections":6},{"courses_dept":"kin","courses_id":"382","numSections":6},{"courses_dept":"kin","courses_id":"383","numSections":6},{"courses_dept":"kin","courses_id":"400","numSections":6},{"courses_dept":"kin","courses_id":"461","numSections":6},{"courses_dept":"kin","courses_id":"462","numSections":6},{"courses_dept":"kin","courses_id":"464","numSections":6},{"courses_dept":"kin","courses_id":"471","numSections":6},{"courses_dept":"kin","courses_id":"473","numSections":6},{"courses_dept":"kin","courses_id":"475","numSections":6},{"courses_dept":"kin","courses_id":"481","numSections":6},{"courses_dept":"kin","courses_id":"562","numSections":6},{"courses_dept":"kin","courses_id":"564","numSections":6},{"courses_dept":"kin","courses_id":"565","numSections":6},{"courses_dept":"kin","courses_id":"570","numSections":6},{"courses_dept":"kin","courses_id":"585","numSections":6},{"courses_dept":"kin","courses_id":"586","numSections":6},{"courses_dept":"latn","courses_id":"101","numSections":6},{"courses_dept":"law","courses_id":"397","numSections":6},{"courses_dept":"law","courses_id":"459","numSections":6},{"courses_dept":"law","courses_id":"460","numSections":6},{"courses_dept":"law","courses_id":"465","numSections":6},{"courses_dept":"law","courses_id":"530","numSections":6},{"courses_dept":"law","courses_id":"560","numSections":6},{"courses_dept":"libr","courses_id":"575","numSections":6},{"courses_dept":"libr","courses_id":"597","numSections":6},{"courses_dept":"ling","courses_id":"313","numSections":6},{"courses_dept":"ling","courses_id":"314","numSections":6},{"courses_dept":"ling","courses_id":"405","numSections":6},{"courses_dept":"lled","courses_id":"450","numSections":6},{"courses_dept":"math","courses_id":"323","numSections":6},{"courses_dept":"math","courses_id":"360","numSections":6},{"courses_dept":"math","courses_id":"406","numSections":6},{"courses_dept":"math","courses_id":"423","numSections":6},{"courses_dept":"math","courses_id":"441","numSections":6},{"courses_dept":"math","courses_id":"442","numSections":6},{"courses_dept":"math","courses_id":"532","numSections":6},{"courses_dept":"math","courses_id":"534","numSections":6},{"courses_dept":"math","courses_id":"539","numSections":6},{"courses_dept":"math","courses_id":"552","numSections":6},{"courses_dept":"mech","courses_id":"563","numSections":6},{"courses_dept":"mech","courses_id":"578","numSections":6},{"courses_dept":"mech","courses_id":"584","numSections":6},{"courses_dept":"micb","courses_id":"408","numSections":6},{"courses_dept":"mine","courses_id":"552","numSections":6},{"courses_dept":"mtrl","courses_id":"456","numSections":6},{"courses_dept":"mtrl","courses_id":"571","numSections":6},{"courses_dept":"mtrl","courses_id":"594","numSections":6},{"courses_dept":"musc","courses_id":"305","numSections":6},{"courses_dept":"musc","courses_id":"323","numSections":6},{"courses_dept":"musc","courses_id":"440","numSections":6},{"courses_dept":"musc","courses_id":"441","numSections":6},{"courses_dept":"musc","courses_id":"454","numSections":6},{"courses_dept":"musc","courses_id":"465","numSections":6},{"courses_dept":"obst","courses_id":"501","numSections":6},{"courses_dept":"obst","courses_id":"504","numSections":6},{"courses_dept":"pcth","courses_id":"502","numSections":6},{"courses_dept":"pcth","courses_id":"512","numSections":6},{"courses_dept":"phar","courses_id":"406","numSections":6},{"courses_dept":"phil","courses_id":"316","numSections":6},{"courses_dept":"phth","courses_id":"511","numSections":6},{"courses_dept":"phth","courses_id":"514","numSections":6},{"courses_dept":"phth","courses_id":"516","numSections":6},{"courses_dept":"phth","courses_id":"521","numSections":6},{"courses_dept":"phth","courses_id":"524","numSections":6},{"courses_dept":"phth","courses_id":"526","numSections":6},{"courses_dept":"phth","courses_id":"528","numSections":6},{"courses_dept":"phth","courses_id":"544","numSections":6},{"courses_dept":"phth","courses_id":"548","numSections":6},{"courses_dept":"phth","courses_id":"564","numSections":6},{"courses_dept":"phth","courses_id":"565","numSections":6},{"courses_dept":"phth","courses_id":"566","numSections":6},{"courses_dept":"phys","courses_id":"157","numSections":6},{"courses_dept":"phys","courses_id":"306","numSections":6},{"courses_dept":"phys","courses_id":"333","numSections":6},{"courses_dept":"phys","courses_id":"503","numSections":6},{"courses_dept":"phys","courses_id":"506","numSections":6},{"courses_dept":"phys","courses_id":"541","numSections":6},{"courses_dept":"phys","courses_id":"543","numSections":6},{"courses_dept":"phys","courses_id":"571","numSections":6},{"courses_dept":"plan","courses_id":"517","numSections":6},{"courses_dept":"plan","courses_id":"542","numSections":6},{"courses_dept":"port","courses_id":"201","numSections":6},{"courses_dept":"port","courses_id":"202","numSections":6},{"courses_dept":"psyc","courses_id":"321","numSections":6},{"courses_dept":"psyc","courses_id":"409","numSections":6},{"courses_dept":"psyc","courses_id":"501","numSections":6},{"courses_dept":"psyc","courses_id":"536","numSections":6},{"courses_dept":"psyc","courses_id":"594","numSections":6},{"courses_dept":"relg","courses_id":"321","numSections":6},{"courses_dept":"rmes","courses_id":"505","numSections":6},{"courses_dept":"rmes","courses_id":"510","numSections":6},{"courses_dept":"rmes","courses_id":"518","numSections":6},{"courses_dept":"rmes","courses_id":"520","numSections":6},{"courses_dept":"soci","courses_id":"220","numSections":6},{"courses_dept":"soci","courses_id":"364","numSections":6},{"courses_dept":"soci","courses_id":"476","numSections":6},{"courses_dept":"soil","courses_id":"515","numSections":6},{"courses_dept":"soil","courses_id":"518","numSections":6},{"courses_dept":"sowk","courses_id":"601","numSections":6},{"courses_dept":"span","courses_id":"504","numSections":6},{"courses_dept":"spph","courses_id":"518","numSections":6},{"courses_dept":"spph","courses_id":"547","numSections":6},{"courses_dept":"stat","courses_id":"300","numSections":6},{"courses_dept":"stat","courses_id":"461","numSections":6},{"courses_dept":"stat","courses_id":"550","numSections":6},{"courses_dept":"sts","courses_id":"501","numSections":6},{"courses_dept":"surg","courses_id":"512","numSections":6},{"courses_dept":"swed","courses_id":"100","numSections":6},{"courses_dept":"thtr","courses_id":"456","numSections":6},{"courses_dept":"thtr","courses_id":"500","numSections":6},{"courses_dept":"thtr","courses_id":"505","numSections":6},{"courses_dept":"vant","courses_id":"148","numSections":6},{"courses_dept":"visa","courses_id":"370","numSections":6},{"courses_dept":"ba","courses_id":"507","numSections":7},{"courses_dept":"babs","courses_id":"540","numSections":7},{"courses_dept":"bams","courses_id":"523","numSections":7},{"courses_dept":"bioc","courses_id":"460","numSections":7},{"courses_dept":"ccst","courses_id":"501","numSections":7},{"courses_dept":"chin","courses_id":"484","numSections":7},{"courses_dept":"comm","courses_id":"660","numSections":7},{"courses_dept":"epse","courses_id":"320","numSections":7},{"courses_dept":"epse","courses_id":"431","numSections":7},{"courses_dept":"epse","courses_id":"516","numSections":7},{"courses_dept":"germ","courses_id":"303","numSections":7},{"courses_dept":"kin","courses_id":"500","numSections":7},{"courses_dept":"relg","courses_id":"306","numSections":7},{"courses_dept":"rmes","courses_id":"599","numSections":7},{"courses_dept":"anth","courses_id":"215","numSections":8},{"courses_dept":"anth","courses_id":"315","numSections":8},{"courses_dept":"anth","courses_id":"517","numSections":8},{"courses_dept":"apbi","courses_id":"426","numSections":8},{"courses_dept":"arst","courses_id":"573","numSections":8},{"courses_dept":"arth","courses_id":"251","numSections":8},{"courses_dept":"arth","courses_id":"347","numSections":8},{"courses_dept":"arth","courses_id":"443","numSections":8},{"courses_dept":"arth","courses_id":"448","numSections":8},{"courses_dept":"asia","courses_id":"200","numSections":8},{"courses_dept":"asia","courses_id":"308","numSections":8},{"courses_dept":"asia","courses_id":"309","numSections":8},{"courses_dept":"asia","courses_id":"317","numSections":8},{"courses_dept":"asia","courses_id":"338","numSections":8},{"courses_dept":"asia","courses_id":"348","numSections":8},{"courses_dept":"asia","courses_id":"363","numSections":8},{"courses_dept":"asia","courses_id":"376","numSections":8},{"courses_dept":"asia","courses_id":"398","numSections":8},{"courses_dept":"astr","courses_id":"405","numSections":8},{"courses_dept":"astr","courses_id":"449","numSections":8},{"courses_dept":"atsc","courses_id":"406","numSections":8},{"courses_dept":"audi","courses_id":"403","numSections":8},{"courses_dept":"audi","courses_id":"513","numSections":8},{"courses_dept":"audi","courses_id":"515","numSections":8},{"courses_dept":"audi","courses_id":"518","numSections":8},{"courses_dept":"audi","courses_id":"522","numSections":8},{"courses_dept":"audi","courses_id":"524","numSections":8},{"courses_dept":"audi","courses_id":"526","numSections":8},{"courses_dept":"audi","courses_id":"528","numSections":8},{"courses_dept":"audi","courses_id":"552","numSections":8},{"courses_dept":"audi","courses_id":"553","numSections":8},{"courses_dept":"audi","courses_id":"556","numSections":8},{"courses_dept":"audi","courses_id":"557","numSections":8},{"courses_dept":"audi","courses_id":"558","numSections":8},{"courses_dept":"audi","courses_id":"562","numSections":8},{"courses_dept":"audi","courses_id":"563","numSections":8},{"courses_dept":"audi","courses_id":"567","numSections":8},{"courses_dept":"audi","courses_id":"568","numSections":8},{"courses_dept":"audi","courses_id":"569","numSections":8},{"courses_dept":"audi","courses_id":"571","numSections":8},{"courses_dept":"audi","courses_id":"572","numSections":8},{"courses_dept":"audi","courses_id":"575","numSections":8},{"courses_dept":"audi","courses_id":"577","numSections":8},{"courses_dept":"audi","courses_id":"581","numSections":8},{"courses_dept":"audi","courses_id":"583","numSections":8},{"courses_dept":"audi","courses_id":"585","numSections":8},{"courses_dept":"audi","courses_id":"586","numSections":8},{"courses_dept":"audi","courses_id":"593","numSections":8},{"courses_dept":"ba","courses_id":"504","numSections":8},{"courses_dept":"bafi","courses_id":"516","numSections":8},{"courses_dept":"bama","courses_id":"541","numSections":8},{"courses_dept":"biol","courses_id":"342","numSections":8},{"courses_dept":"biol","courses_id":"345","numSections":8},{"courses_dept":"biol","courses_id":"406","numSections":8},{"courses_dept":"biol","courses_id":"417","numSections":8},{"courses_dept":"biol","courses_id":"509","numSections":8},{"courses_dept":"caps","courses_id":"390","numSections":8},{"courses_dept":"caps","courses_id":"391","numSections":8},{"courses_dept":"ccst","courses_id":"503","numSections":8},{"courses_dept":"cell","courses_id":"504","numSections":8},{"courses_dept":"cell","courses_id":"511","numSections":8},{"courses_dept":"chbe","courses_id":"366","numSections":8},{"courses_dept":"chbe","courses_id":"452","numSections":8},{"courses_dept":"chbe","courses_id":"477","numSections":8},{"courses_dept":"chbe","courses_id":"483","numSections":8},{"courses_dept":"chbe","courses_id":"560","numSections":8},{"courses_dept":"chbe","courses_id":"573","numSections":8},{"courses_dept":"chbe","courses_id":"583","numSections":8},{"courses_dept":"chem","courses_id":"213","numSections":8},{"courses_dept":"chem","courses_id":"341","numSections":8},{"courses_dept":"chem","courses_id":"406","numSections":8},{"courses_dept":"chem","courses_id":"435","numSections":8},{"courses_dept":"chem","courses_id":"526","numSections":8},{"courses_dept":"chem","courses_id":"534","numSections":8},{"courses_dept":"chin","courses_id":"413","numSections":8},{"courses_dept":"civl","courses_id":"415","numSections":8},{"courses_dept":"civl","courses_id":"420","numSections":8},{"courses_dept":"civl","courses_id":"432","numSections":8},{"courses_dept":"civl","courses_id":"446","numSections":8},{"courses_dept":"civl","courses_id":"511","numSections":8},{"courses_dept":"civl","courses_id":"529","numSections":8},{"courses_dept":"civl","courses_id":"540","numSections":8},{"courses_dept":"clst","courses_id":"319","numSections":8},{"courses_dept":"clst","courses_id":"333","numSections":8},{"courses_dept":"clst","courses_id":"355","numSections":8},{"courses_dept":"cohr","courses_id":"404","numSections":8},{"courses_dept":"cohr","courses_id":"405","numSections":8},{"courses_dept":"cohr","courses_id":"411","numSections":8},{"courses_dept":"comm","courses_id":"100","numSections":8},{"courses_dept":"comm","courses_id":"461","numSections":8},{"courses_dept":"cons","courses_id":"210","numSections":8},{"courses_dept":"cpsc","courses_id":"259","numSections":8},{"courses_dept":"cpsc","courses_id":"444","numSections":8},{"courses_dept":"cpsc","courses_id":"501","numSections":8},{"courses_dept":"cpsc","courses_id":"502","numSections":8},{"courses_dept":"cpsc","courses_id":"509","numSections":8},{"courses_dept":"cpsc","courses_id":"543","numSections":8},{"courses_dept":"dent","courses_id":"504","numSections":8},{"courses_dept":"dhyg","courses_id":"402","numSections":8},{"courses_dept":"econ","courses_id":"337","numSections":8},{"courses_dept":"econ","courses_id":"451","numSections":8},{"courses_dept":"econ","courses_id":"531","numSections":8},{"courses_dept":"econ","courses_id":"566","numSections":8},{"courses_dept":"econ","courses_id":"573","numSections":8},{"courses_dept":"edcp","courses_id":"510","numSections":8},{"courses_dept":"edcp","courses_id":"564","numSections":8},{"courses_dept":"edst","courses_id":"505","numSections":8},{"courses_dept":"edst","courses_id":"514","numSections":8},{"courses_dept":"edst","courses_id":"520","numSections":8},{"courses_dept":"edst","courses_id":"521","numSections":8},{"courses_dept":"eece","courses_id":"527","numSections":8},{"courses_dept":"eece","courses_id":"532","numSections":8},{"courses_dept":"eece","courses_id":"541","numSections":8},{"courses_dept":"eece","courses_id":"564","numSections":8},{"courses_dept":"eece","courses_id":"566","numSections":8},{"courses_dept":"eece","courses_id":"573","numSections":8},{"courses_dept":"eece","courses_id":"574","numSections":8},{"courses_dept":"eece","courses_id":"576","numSections":8},{"courses_dept":"eece","courses_id":"580","numSections":8},{"courses_dept":"eece","courses_id":"583","numSections":8},{"courses_dept":"ends","courses_id":"221","numSections":8},{"courses_dept":"enph","courses_id":"259","numSections":8},{"courses_dept":"enph","courses_id":"459","numSections":8},{"courses_dept":"enph","courses_id":"479","numSections":8},{"courses_dept":"envr","courses_id":"410","numSections":8},{"courses_dept":"eosc","courses_id":"445","numSections":8},{"courses_dept":"eosc","courses_id":"510","numSections":8},{"courses_dept":"eosc","courses_id":"531","numSections":8},{"courses_dept":"eosc","courses_id":"534","numSections":8},{"courses_dept":"eosc","courses_id":"536","numSections":8},{"courses_dept":"epse","courses_id":"591","numSections":8},{"courses_dept":"fish","courses_id":"520","numSections":8},{"courses_dept":"fist","courses_id":"445","numSections":8},{"courses_dept":"fnh","courses_id":"455","numSections":8},{"courses_dept":"food","courses_id":"525","numSections":8},{"courses_dept":"fre","courses_id":"503","numSections":8},{"courses_dept":"fre","courses_id":"515","numSections":8},{"courses_dept":"fre","courses_id":"525","numSections":8},{"courses_dept":"fre","courses_id":"528","numSections":8},{"courses_dept":"fren","courses_id":"457","numSections":8},{"courses_dept":"frst","courses_id":"311","numSections":8},{"courses_dept":"frst","courses_id":"436","numSections":8},{"courses_dept":"frst","courses_id":"523","numSections":8},{"courses_dept":"frst","courses_id":"588","numSections":8},{"courses_dept":"geog","courses_id":"446","numSections":8},{"courses_dept":"geog","courses_id":"525","numSections":8},{"courses_dept":"germ","courses_id":"314","numSections":8},{"courses_dept":"grsj","courses_id":"101","numSections":8},{"courses_dept":"hist","courses_id":"273","numSections":8},{"courses_dept":"hist","courses_id":"302","numSections":8},{"courses_dept":"hist","courses_id":"313","numSections":8},{"courses_dept":"hist","courses_id":"318","numSections":8},{"courses_dept":"hist","courses_id":"324","numSections":8},{"courses_dept":"hist","courses_id":"338","numSections":8},{"courses_dept":"hist","courses_id":"405","numSections":8},{"courses_dept":"hist","courses_id":"408","numSections":8},{"courses_dept":"hist","courses_id":"476","numSections":8},{"courses_dept":"hist","courses_id":"483","numSections":8},{"courses_dept":"hist","courses_id":"485","numSections":8},{"courses_dept":"hist","courses_id":"699","numSections":8},{"courses_dept":"igen","courses_id":"201","numSections":8},{"courses_dept":"igen","courses_id":"230","numSections":8},{"courses_dept":"igen","courses_id":"330","numSections":8},{"courses_dept":"igen","courses_id":"430","numSections":8},{"courses_dept":"isci","courses_id":"360","numSections":8},{"courses_dept":"itst","courses_id":"110","numSections":8},{"courses_dept":"itst","courses_id":"385","numSections":8},{"courses_dept":"japn","courses_id":"312","numSections":8},{"courses_dept":"japn","courses_id":"314","numSections":8},{"courses_dept":"japn","courses_id":"315","numSections":8},{"courses_dept":"jrnl","courses_id":"534","numSections":8},{"courses_dept":"kin","courses_id":"469","numSections":8},{"courses_dept":"kin","courses_id":"598","numSections":8},{"courses_dept":"korn","courses_id":"101","numSections":8},{"courses_dept":"larc","courses_id":"541","numSections":8},{"courses_dept":"larc","courses_id":"542","numSections":8},{"courses_dept":"law","courses_id":"372","numSections":8},{"courses_dept":"law","courses_id":"386","numSections":8},{"courses_dept":"law","courses_id":"394","numSections":8},{"courses_dept":"law","courses_id":"404","numSections":8},{"courses_dept":"law","courses_id":"439","numSections":8},{"courses_dept":"law","courses_id":"505","numSections":8},{"courses_dept":"libr","courses_id":"534","numSections":8},{"courses_dept":"ling","courses_id":"532","numSections":8},{"courses_dept":"lled","courses_id":"446","numSections":8},{"courses_dept":"lled","courses_id":"577","numSections":8},{"courses_dept":"lled","courses_id":"602","numSections":8},{"courses_dept":"math","courses_id":"419","numSections":8},{"courses_dept":"math","courses_id":"502","numSections":8},{"courses_dept":"math","courses_id":"503","numSections":8},{"courses_dept":"math","courses_id":"537","numSections":8},{"courses_dept":"mech","courses_id":"358","numSections":8},{"courses_dept":"mech","courses_id":"445","numSections":8},{"courses_dept":"mech","courses_id":"463","numSections":8},{"courses_dept":"mech","courses_id":"468","numSections":8},{"courses_dept":"mech","courses_id":"522","numSections":8},{"courses_dept":"mech","courses_id":"529","numSections":8},{"courses_dept":"mech","courses_id":"535","numSections":8},{"courses_dept":"mech","courses_id":"545","numSections":8},{"courses_dept":"medi","courses_id":"530","numSections":8},{"courses_dept":"micb","courses_id":"308","numSections":8},{"courses_dept":"micb","courses_id":"424","numSections":8},{"courses_dept":"micb","courses_id":"425","numSections":8},{"courses_dept":"micb","courses_id":"449","numSections":8},{"courses_dept":"midw","courses_id":"101","numSections":8},{"courses_dept":"midw","courses_id":"102","numSections":8},{"courses_dept":"midw","courses_id":"103","numSections":8},{"courses_dept":"midw","courses_id":"104","numSections":8},{"courses_dept":"midw","courses_id":"105","numSections":8},{"courses_dept":"midw","courses_id":"110","numSections":8},{"courses_dept":"midw","courses_id":"125","numSections":8},{"courses_dept":"midw","courses_id":"215","numSections":8},{"courses_dept":"midw","courses_id":"221","numSections":8},{"courses_dept":"midw","courses_id":"305","numSections":8},{"courses_dept":"midw","courses_id":"310","numSections":8},{"courses_dept":"midw","courses_id":"430","numSections":8},{"courses_dept":"mine","courses_id":"556","numSections":8},{"courses_dept":"mine","courses_id":"582","numSections":8},{"courses_dept":"mrne","courses_id":"415","numSections":8},{"courses_dept":"mrne","courses_id":"425","numSections":8},{"courses_dept":"mrne","courses_id":"437","numSections":8},{"courses_dept":"mrne","courses_id":"480","numSections":8},{"courses_dept":"mtrl","courses_id":"340","numSections":8},{"courses_dept":"mtrl","courses_id":"392","numSections":8},{"courses_dept":"mtrl","courses_id":"460","numSections":8},{"courses_dept":"mtrl","courses_id":"585","numSections":8},{"courses_dept":"musc","courses_id":"104","numSections":8},{"courses_dept":"musc","courses_id":"119","numSections":8},{"courses_dept":"musc","courses_id":"249","numSections":8},{"courses_dept":"nurs","courses_id":"530","numSections":8},{"courses_dept":"nurs","courses_id":"554","numSections":8},{"courses_dept":"nurs","courses_id":"580","numSections":8},{"courses_dept":"obst","courses_id":"502","numSections":8},{"courses_dept":"path","courses_id":"437","numSections":8},{"courses_dept":"pcth","courses_id":"513","numSections":8},{"courses_dept":"phar","courses_id":"448","numSections":8},{"courses_dept":"phar","courses_id":"458","numSections":8},{"courses_dept":"phil","courses_id":"371","numSections":8},{"courses_dept":"phil","courses_id":"378","numSections":8},{"courses_dept":"phth","courses_id":"531","numSections":8},{"courses_dept":"phys","courses_id":"314","numSections":8},{"courses_dept":"plan","courses_id":"602","numSections":8},{"courses_dept":"poli","courses_id":"304","numSections":8},{"courses_dept":"poli","courses_id":"310","numSections":8},{"courses_dept":"port","courses_id":"101","numSections":8},{"courses_dept":"port","courses_id":"102","numSections":8},{"courses_dept":"psyc","courses_id":"311","numSections":8},{"courses_dept":"psyc","courses_id":"363","numSections":8},{"courses_dept":"psyc","courses_id":"461","numSections":8},{"courses_dept":"psyc","courses_id":"542","numSections":8},{"courses_dept":"punj","courses_id":"300","numSections":8},{"courses_dept":"relg","courses_id":"414","numSections":8},{"courses_dept":"rmes","courses_id":"501","numSections":8},{"courses_dept":"rmes","courses_id":"515","numSections":8},{"courses_dept":"rmes","courses_id":"550","numSections":8},{"courses_dept":"rmst","courses_id":"222","numSections":8},{"courses_dept":"soil","courses_id":"520","numSections":8},{"courses_dept":"sowk","courses_id":"450","numSections":8},{"courses_dept":"sowk","courses_id":"571","numSections":8},{"courses_dept":"sowk","courses_id":"621","numSections":8},{"courses_dept":"sowk","courses_id":"654","numSections":8},{"courses_dept":"spph","courses_id":"519","numSections":8},{"courses_dept":"spph","courses_id":"534","numSections":8},{"courses_dept":"spph","courses_id":"535","numSections":8},{"courses_dept":"spph","courses_id":"544","numSections":8},{"courses_dept":"spph","courses_id":"555","numSections":8},{"courses_dept":"spph","courses_id":"562","numSections":8},{"courses_dept":"spph","courses_id":"563","numSections":8},{"courses_dept":"spph","courses_id":"567","numSections":8},{"courses_dept":"stat","courses_id":"589","numSections":8},{"courses_dept":"thtr","courses_id":"150","numSections":8},{"courses_dept":"thtr","courses_id":"210","numSections":8},{"courses_dept":"thtr","courses_id":"211","numSections":8},{"courses_dept":"thtr","courses_id":"310","numSections":8},{"courses_dept":"thtr","courses_id":"323","numSections":8},{"courses_dept":"thtr","courses_id":"410","numSections":8},{"courses_dept":"visa","courses_id":"360","numSections":8},{"courses_dept":"wood","courses_id":"493","numSections":8},{"courses_dept":"apbi","courses_id":"324","numSections":9},{"courses_dept":"apbi","courses_id":"499","numSections":9},{"courses_dept":"arst","courses_id":"591","numSections":9},{"courses_dept":"asic","courses_id":"200","numSections":9},{"courses_dept":"ba","courses_id":"563","numSections":9},{"courses_dept":"ba","courses_id":"564","numSections":9},{"courses_dept":"baen","courses_id":"541","numSections":9},{"courses_dept":"biol","courses_id":"340","numSections":9},{"courses_dept":"crwr","courses_id":"208","numSections":9},{"courses_dept":"edcp","courses_id":"513","numSections":9},{"courses_dept":"eosc","courses_id":"442","numSections":9},{"courses_dept":"germ","courses_id":"304","numSections":9},{"courses_dept":"hist","courses_id":"368","numSections":9},{"courses_dept":"kin","courses_id":"230","numSections":9},{"courses_dept":"kin","courses_id":"231","numSections":9},{"courses_dept":"kin","courses_id":"369","numSections":9},{"courses_dept":"kin","courses_id":"371","numSections":9},{"courses_dept":"kin","courses_id":"373","numSections":9},{"courses_dept":"kin","courses_id":"415","numSections":9},{"courses_dept":"kin","courses_id":"595","numSections":9},{"courses_dept":"law","courses_id":"451","numSections":9},{"courses_dept":"law","courses_id":"509","numSections":9},{"courses_dept":"law","courses_id":"525","numSections":9},{"courses_dept":"medg","courses_id":"410","numSections":9},{"courses_dept":"pers","courses_id":"104","numSections":9},{"courses_dept":"rmes","courses_id":"502","numSections":9},{"courses_dept":"span","courses_id":"221","numSections":9},{"courses_dept":"spph","courses_id":"503","numSections":9},{"courses_dept":"thtr","courses_id":"130","numSections":9},{"courses_dept":"anth","courses_id":"220","numSections":10},{"courses_dept":"anth","courses_id":"407","numSections":10},{"courses_dept":"anth","courses_id":"418","numSections":10},{"courses_dept":"anth","courses_id":"428","numSections":10},{"courses_dept":"anth","courses_id":"500","numSections":10},{"courses_dept":"anth","courses_id":"516","numSections":10},{"courses_dept":"apbi","courses_id":"210","numSections":10},{"courses_dept":"apbi","courses_id":"322","numSections":10},{"courses_dept":"apbi","courses_id":"328","numSections":10},{"courses_dept":"apbi","courses_id":"351","numSections":10},{"courses_dept":"apbi","courses_id":"498","numSections":10},{"courses_dept":"apsc","courses_id":"261","numSections":10},{"courses_dept":"apsc","courses_id":"262","numSections":10},{"courses_dept":"apsc","courses_id":"440","numSections":10},{"courses_dept":"apsc","courses_id":"486","numSections":10},{"courses_dept":"apsc","courses_id":"541","numSections":10},{"courses_dept":"arch","courses_id":"568","numSections":10},{"courses_dept":"arst","courses_id":"500","numSections":10},{"courses_dept":"arst","courses_id":"510","numSections":10},{"courses_dept":"arst","courses_id":"515","numSections":10},{"courses_dept":"arst","courses_id":"516","numSections":10},{"courses_dept":"arst","courses_id":"520","numSections":10},{"courses_dept":"arst","courses_id":"540","numSections":10},{"courses_dept":"arst","courses_id":"545","numSections":10},{"courses_dept":"arst","courses_id":"550","numSections":10},{"courses_dept":"arst","courses_id":"555","numSections":10},{"courses_dept":"arst","courses_id":"587","numSections":10},{"courses_dept":"arth","courses_id":"338","numSections":10},{"courses_dept":"arth","courses_id":"339","numSections":10},{"courses_dept":"arth","courses_id":"376","numSections":10},{"courses_dept":"arth","courses_id":"377","numSections":10},{"courses_dept":"arth","courses_id":"436","numSections":10},{"courses_dept":"arth","courses_id":"571","numSections":10},{"courses_dept":"asia","courses_id":"318","numSections":10},{"courses_dept":"asia","courses_id":"337","numSections":10},{"courses_dept":"asia","courses_id":"347","numSections":10},{"courses_dept":"asia","courses_id":"371","numSections":10},{"courses_dept":"asia","courses_id":"382","numSections":10},{"courses_dept":"asia","courses_id":"411","numSections":10},{"courses_dept":"asia","courses_id":"488","numSections":10},{"courses_dept":"astr","courses_id":"404","numSections":10},{"courses_dept":"astu","courses_id":"201","numSections":10},{"courses_dept":"ba","courses_id":"511","numSections":10},{"courses_dept":"ba","courses_id":"560","numSections":10},{"courses_dept":"baac","courses_id":"511","numSections":10},{"courses_dept":"baen","courses_id":"505","numSections":10},{"courses_dept":"baen","courses_id":"550","numSections":10},{"courses_dept":"bait","courses_id":"513","numSections":10},{"courses_dept":"bait","courses_id":"550","numSections":10},{"courses_dept":"bama","courses_id":"504","numSections":10},{"courses_dept":"bama","courses_id":"506","numSections":10},{"courses_dept":"bama","courses_id":"513","numSections":10},{"courses_dept":"basc","courses_id":"550","numSections":10},{"courses_dept":"baul","courses_id":"501","numSections":10},{"courses_dept":"bioc","courses_id":"202","numSections":10},{"courses_dept":"biof","courses_id":"520","numSections":10},{"courses_dept":"biol","courses_id":"317","numSections":10},{"courses_dept":"biol","courses_id":"416","numSections":10},{"courses_dept":"biol","courses_id":"433","numSections":10},{"courses_dept":"biol","courses_id":"436","numSections":10},{"courses_dept":"biol","courses_id":"440","numSections":10},{"courses_dept":"bmeg","courses_id":"456","numSections":10},{"courses_dept":"bmeg","courses_id":"550","numSections":10},{"courses_dept":"bmeg","courses_id":"556","numSections":10},{"courses_dept":"caps","courses_id":"301","numSections":10},{"courses_dept":"cell","courses_id":"502","numSections":10},{"courses_dept":"cell","courses_id":"505","numSections":10},{"courses_dept":"chbe","courses_id":"243","numSections":10},{"courses_dept":"chbe","courses_id":"244","numSections":10},{"courses_dept":"chbe","courses_id":"577","numSections":10},{"courses_dept":"chem","courses_id":"413","numSections":10},{"courses_dept":"chem","courses_id":"417","numSections":10},{"courses_dept":"chem","courses_id":"569","numSections":10},{"courses_dept":"chin","courses_id":"303","numSections":10},{"courses_dept":"civl","courses_id":"417","numSections":10},{"courses_dept":"civl","courses_id":"478","numSections":10},{"courses_dept":"civl","courses_id":"505","numSections":10},{"courses_dept":"civl","courses_id":"513","numSections":10},{"courses_dept":"civl","courses_id":"582","numSections":10},{"courses_dept":"clst","courses_id":"356","numSections":10},{"courses_dept":"cnps","courses_id":"535","numSections":10},{"courses_dept":"cnps","courses_id":"594","numSections":10},{"courses_dept":"cohr","courses_id":"304","numSections":10},{"courses_dept":"cohr","courses_id":"401","numSections":10},{"courses_dept":"cohr","courses_id":"402","numSections":10},{"courses_dept":"cohr","courses_id":"433","numSections":10},{"courses_dept":"cons","courses_id":"101","numSections":10},{"courses_dept":"cons","courses_id":"330","numSections":10},{"courses_dept":"cons","courses_id":"340","numSections":10},{"courses_dept":"cons","courses_id":"425","numSections":10},{"courses_dept":"cons","courses_id":"451","numSections":10},{"courses_dept":"cons","courses_id":"452","numSections":10},{"courses_dept":"cons","courses_id":"481","numSections":10},{"courses_dept":"cons","courses_id":"486","numSections":10},{"courses_dept":"cons","courses_id":"495","numSections":10},{"courses_dept":"cpsc","courses_id":"449","numSections":10},{"courses_dept":"cpsc","courses_id":"490","numSections":10},{"courses_dept":"cpsc","courses_id":"521","numSections":10},{"courses_dept":"cpsc","courses_id":"540","numSections":10},{"courses_dept":"crwr","courses_id":"203","numSections":10},{"courses_dept":"dent","courses_id":"524","numSections":10},{"courses_dept":"dent","courses_id":"574","numSections":10},{"courses_dept":"dhyg","courses_id":"108","numSections":10},{"courses_dept":"dhyg","courses_id":"110","numSections":10},{"courses_dept":"dhyg","courses_id":"206","numSections":10},{"courses_dept":"dhyg","courses_id":"208","numSections":10},{"courses_dept":"dhyg","courses_id":"210","numSections":10},{"courses_dept":"dhyg","courses_id":"310","numSections":10},{"courses_dept":"dhyg","courses_id":"410","numSections":10},{"courses_dept":"dhyg","courses_id":"433","numSections":10},{"courses_dept":"eced","courses_id":"440","numSections":10},{"courses_dept":"eced","courses_id":"441","numSections":10},{"courses_dept":"econ","courses_id":"210","numSections":10},{"courses_dept":"econ","courses_id":"211","numSections":10},{"courses_dept":"econ","courses_id":"317","numSections":10},{"courses_dept":"econ","courses_id":"318","numSections":10},{"courses_dept":"econ","courses_id":"441","numSections":10},{"courses_dept":"econ","courses_id":"442","numSections":10},{"courses_dept":"econ","courses_id":"460","numSections":10},{"courses_dept":"econ","courses_id":"514","numSections":10},{"courses_dept":"econ","courses_id":"557","numSections":10},{"courses_dept":"econ","courses_id":"561","numSections":10},{"courses_dept":"econ","courses_id":"565","numSections":10},{"courses_dept":"edcp","courses_id":"303","numSections":10},{"courses_dept":"edcp","courses_id":"304","numSections":10},{"courses_dept":"edcp","courses_id":"305","numSections":10},{"courses_dept":"edst","courses_id":"503","numSections":10},{"courses_dept":"edst","courses_id":"515","numSections":10},{"courses_dept":"edst","courses_id":"541","numSections":10},{"courses_dept":"edst","courses_id":"543","numSections":10},{"courses_dept":"edst","courses_id":"544","numSections":10},{"courses_dept":"edst","courses_id":"570","numSections":10},{"courses_dept":"edst","courses_id":"597","numSections":10},{"courses_dept":"educ","courses_id":"504","numSections":10},{"courses_dept":"eece","courses_id":"509","numSections":10},{"courses_dept":"eece","courses_id":"544","numSections":10},{"courses_dept":"eece","courses_id":"549","numSections":10},{"courses_dept":"eece","courses_id":"553","numSections":10},{"courses_dept":"eece","courses_id":"560","numSections":10},{"courses_dept":"eece","courses_id":"562","numSections":10},{"courses_dept":"eece","courses_id":"563","numSections":10},{"courses_dept":"eece","courses_id":"565","numSections":10},{"courses_dept":"eece","courses_id":"569","numSections":10},{"courses_dept":"eece","courses_id":"584","numSections":10},{"courses_dept":"eece","courses_id":"592","numSections":10},{"courses_dept":"engl","courses_id":"309","numSections":10},{"courses_dept":"engl","courses_id":"310","numSections":10},{"courses_dept":"engl","courses_id":"311","numSections":10},{"courses_dept":"envr","courses_id":"400","numSections":10},{"courses_dept":"eosc","courses_id":"422","numSections":10},{"courses_dept":"eosc","courses_id":"449","numSections":10},{"courses_dept":"eosc","courses_id":"450","numSections":10},{"courses_dept":"eosc","courses_id":"453","numSections":10},{"courses_dept":"eosc","courses_id":"473","numSections":10},{"courses_dept":"eosc","courses_id":"475","numSections":10},{"courses_dept":"eosc","courses_id":"478","numSections":10},{"courses_dept":"eosc","courses_id":"542","numSections":10},{"courses_dept":"eosc","courses_id":"546","numSections":10},{"courses_dept":"eosc","courses_id":"547","numSections":10},{"courses_dept":"eosc","courses_id":"598","numSections":10},{"courses_dept":"epse","courses_id":"503","numSections":10},{"courses_dept":"epse","courses_id":"569","numSections":10},{"courses_dept":"fipr","courses_id":"433","numSections":10},{"courses_dept":"fipr","courses_id":"434","numSections":10},{"courses_dept":"fist","courses_id":"200","numSections":10},{"courses_dept":"fist","courses_id":"436","numSections":10},{"courses_dept":"fmst","courses_id":"440","numSections":10},{"courses_dept":"fmst","courses_id":"442","numSections":10},{"courses_dept":"food","courses_id":"521","numSections":10},{"courses_dept":"food","courses_id":"529","numSections":10},{"courses_dept":"fopr","courses_id":"464","numSections":10},{"courses_dept":"frst","courses_id":"100","numSections":10},{"courses_dept":"frst","courses_id":"200","numSections":10},{"courses_dept":"frst","courses_id":"201","numSections":10},{"courses_dept":"frst","courses_id":"210","numSections":10},{"courses_dept":"frst","courses_id":"211","numSections":10},{"courses_dept":"frst","courses_id":"239","numSections":10},{"courses_dept":"frst","courses_id":"270","numSections":10},{"courses_dept":"frst","courses_id":"302","numSections":10},{"courses_dept":"frst","courses_id":"303","numSections":10},{"courses_dept":"frst","courses_id":"304","numSections":10},{"courses_dept":"frst","courses_id":"305","numSections":10},{"courses_dept":"frst","courses_id":"307","numSections":10},{"courses_dept":"frst","courses_id":"308","numSections":10},{"courses_dept":"frst","courses_id":"318","numSections":10},{"courses_dept":"frst","courses_id":"320","numSections":10},{"courses_dept":"frst","courses_id":"339","numSections":10},{"courses_dept":"frst","courses_id":"351","numSections":10},{"courses_dept":"frst","courses_id":"385","numSections":10},{"courses_dept":"frst","courses_id":"386","numSections":10},{"courses_dept":"frst","courses_id":"395","numSections":10},{"courses_dept":"frst","courses_id":"399","numSections":10},{"courses_dept":"frst","courses_id":"413","numSections":10},{"courses_dept":"frst","courses_id":"415","numSections":10},{"courses_dept":"frst","courses_id":"424","numSections":10},{"courses_dept":"frst","courses_id":"430","numSections":10},{"courses_dept":"frst","courses_id":"432","numSections":10},{"courses_dept":"frst","courses_id":"439","numSections":10},{"courses_dept":"frst","courses_id":"443","numSections":10},{"courses_dept":"frst","courses_id":"444","numSections":10},{"courses_dept":"frst","courses_id":"495","numSections":10},{"courses_dept":"frst","courses_id":"497","numSections":10},{"courses_dept":"frst","courses_id":"498","numSections":10},{"courses_dept":"frst","courses_id":"545","numSections":10},{"courses_dept":"frst","courses_id":"546","numSections":10},{"courses_dept":"frst","courses_id":"547","numSections":10},{"courses_dept":"geob","courses_id":"401","numSections":10},{"courses_dept":"geob","courses_id":"402","numSections":10},{"courses_dept":"geob","courses_id":"407","numSections":10},{"courses_dept":"geog","courses_id":"361","numSections":10},{"courses_dept":"geog","courses_id":"380","numSections":10},{"courses_dept":"geog","courses_id":"450","numSections":10},{"courses_dept":"germ","courses_id":"313","numSections":10},{"courses_dept":"germ","courses_id":"400","numSections":10},{"courses_dept":"germ","courses_id":"410","numSections":10},{"courses_dept":"gsat","courses_id":"501","numSections":10},{"courses_dept":"gsat","courses_id":"502","numSections":10},{"courses_dept":"hinu","courses_id":"102","numSections":10},{"courses_dept":"hist","courses_id":"323","numSections":10},{"courses_dept":"hist","courses_id":"350","numSections":10},{"courses_dept":"hist","courses_id":"363","numSections":10},{"courses_dept":"hist","courses_id":"364","numSections":10},{"courses_dept":"hist","courses_id":"365","numSections":10},{"courses_dept":"hist","courses_id":"367","numSections":10},{"courses_dept":"hist","courses_id":"393","numSections":10},{"courses_dept":"hist","courses_id":"409","numSections":10},{"courses_dept":"hist","courses_id":"418","numSections":10},{"courses_dept":"hist","courses_id":"599","numSections":10},{"courses_dept":"hunu","courses_id":"500","numSections":10},{"courses_dept":"isci","courses_id":"320","numSections":10},{"courses_dept":"isci","courses_id":"350","numSections":10},{"courses_dept":"itst","courses_id":"419","numSections":10},{"courses_dept":"japn","courses_id":"311","numSections":10},{"courses_dept":"kin","courses_id":"365","numSections":10},{"courses_dept":"larc","courses_id":"522","numSections":10},{"courses_dept":"larc","courses_id":"532","numSections":10},{"courses_dept":"last","courses_id":"100","numSections":10},{"courses_dept":"last","courses_id":"201","numSections":10},{"courses_dept":"law","courses_id":"305","numSections":10},{"courses_dept":"law","courses_id":"356","numSections":10},{"courses_dept":"law","courses_id":"382","numSections":10},{"courses_dept":"law","courses_id":"395","numSections":10},{"courses_dept":"law","courses_id":"453","numSections":10},{"courses_dept":"lfs","courses_id":"501","numSections":10},{"courses_dept":"libr","courses_id":"520","numSections":10},{"courses_dept":"libr","courses_id":"521","numSections":10},{"courses_dept":"libr","courses_id":"523","numSections":10},{"courses_dept":"libr","courses_id":"529","numSections":10},{"courses_dept":"libr","courses_id":"551","numSections":10},{"courses_dept":"libr","courses_id":"581","numSections":10},{"courses_dept":"libr","courses_id":"582","numSections":10},{"courses_dept":"ling","courses_id":"222","numSections":10},{"courses_dept":"ling","courses_id":"433","numSections":10},{"courses_dept":"math","courses_id":"421","numSections":10},{"courses_dept":"math","courses_id":"425","numSections":10},{"courses_dept":"math","courses_id":"440","numSections":10},{"courses_dept":"math","courses_id":"501","numSections":10},{"courses_dept":"math","courses_id":"508","numSections":10},{"courses_dept":"math","courses_id":"527","numSections":10},{"courses_dept":"mdvl","courses_id":"301","numSections":10},{"courses_dept":"mech","courses_id":"423","numSections":10},{"courses_dept":"mech","courses_id":"433","numSections":10},{"courses_dept":"mech","courses_id":"435","numSections":10},{"courses_dept":"mech","courses_id":"459","numSections":10},{"courses_dept":"mech","courses_id":"462","numSections":10},{"courses_dept":"mech","courses_id":"481","numSections":10},{"courses_dept":"mech","courses_id":"484","numSections":10},{"courses_dept":"mech","courses_id":"495","numSections":10},{"courses_dept":"mech","courses_id":"502","numSections":10},{"courses_dept":"mech","courses_id":"506","numSections":10},{"courses_dept":"mech","courses_id":"514","numSections":10},{"courses_dept":"mech","courses_id":"533","numSections":10},{"courses_dept":"mech","courses_id":"536","numSections":10},{"courses_dept":"mech","courses_id":"572","numSections":10},{"courses_dept":"mech","courses_id":"592","numSections":10},{"courses_dept":"medi","courses_id":"570","numSections":10},{"courses_dept":"medi","courses_id":"590","numSections":10},{"courses_dept":"micb","courses_id":"301","numSections":10},{"courses_dept":"micb","courses_id":"325","numSections":10},{"courses_dept":"micb","courses_id":"404","numSections":10},{"courses_dept":"midw","courses_id":"405","numSections":10},{"courses_dept":"mine","courses_id":"396","numSections":10},{"courses_dept":"mine","courses_id":"485","numSections":10},{"courses_dept":"mine","courses_id":"486","numSections":10},{"courses_dept":"mine","courses_id":"488","numSections":10},{"courses_dept":"mtrl","courses_id":"472","numSections":10},{"courses_dept":"mtrl","courses_id":"485","numSections":10},{"courses_dept":"mtrl","courses_id":"557","numSections":10},{"courses_dept":"mtrl","courses_id":"595","numSections":10},{"courses_dept":"musc","courses_id":"563","numSections":10},{"courses_dept":"nest","courses_id":"301","numSections":10},{"courses_dept":"nurs","courses_id":"302","numSections":10},{"courses_dept":"nurs","courses_id":"303","numSections":10},{"courses_dept":"nurs","courses_id":"304","numSections":10},{"courses_dept":"nurs","courses_id":"305","numSections":10},{"courses_dept":"nurs","courses_id":"306","numSections":10},{"courses_dept":"nurs","courses_id":"338","numSections":10},{"courses_dept":"nurs","courses_id":"339","numSections":10},{"courses_dept":"nurs","courses_id":"341","numSections":10},{"courses_dept":"nurs","courses_id":"343","numSections":10},{"courses_dept":"nurs","courses_id":"420","numSections":10},{"courses_dept":"nurs","courses_id":"422","numSections":10},{"courses_dept":"nurs","courses_id":"423","numSections":10},{"courses_dept":"nurs","courses_id":"424","numSections":10},{"courses_dept":"nurs","courses_id":"425","numSections":10},{"courses_dept":"nurs","courses_id":"506","numSections":10},{"courses_dept":"nurs","courses_id":"507","numSections":10},{"courses_dept":"nurs","courses_id":"508","numSections":10},{"courses_dept":"nurs","courses_id":"509","numSections":10},{"courses_dept":"nurs","courses_id":"510","numSections":10},{"courses_dept":"nurs","courses_id":"512","numSections":10},{"courses_dept":"nurs","courses_id":"520","numSections":10},{"courses_dept":"nurs","courses_id":"549","numSections":10},{"courses_dept":"nurs","courses_id":"570","numSections":10},{"courses_dept":"nurs","courses_id":"571","numSections":10},{"courses_dept":"nurs","courses_id":"572","numSections":10},{"courses_dept":"nurs","courses_id":"578","numSections":10},{"courses_dept":"nurs","courses_id":"591","numSections":10},{"courses_dept":"pers","courses_id":"101","numSections":10},{"courses_dept":"phar","courses_id":"315","numSections":10},{"courses_dept":"phar","courses_id":"321","numSections":10},{"courses_dept":"phar","courses_id":"323","numSections":10},{"courses_dept":"phar","courses_id":"330","numSections":10},{"courses_dept":"phar","courses_id":"341","numSections":10},{"courses_dept":"phar","courses_id":"342","numSections":10},{"courses_dept":"phar","courses_id":"351","numSections":10},{"courses_dept":"phar","courses_id":"361","numSections":10},{"courses_dept":"phar","courses_id":"362","numSections":10},{"courses_dept":"phar","courses_id":"371","numSections":10},{"courses_dept":"phar","courses_id":"399","numSections":10},{"courses_dept":"phar","courses_id":"408","numSections":10},{"courses_dept":"phar","courses_id":"430","numSections":10},{"courses_dept":"phar","courses_id":"440","numSections":10},{"courses_dept":"phar","courses_id":"441","numSections":10},{"courses_dept":"phar","courses_id":"442","numSections":10},{"courses_dept":"phar","courses_id":"451","numSections":10},{"courses_dept":"phar","courses_id":"452","numSections":10},{"courses_dept":"phar","courses_id":"454","numSections":10},{"courses_dept":"phar","courses_id":"456","numSections":10},{"courses_dept":"phar","courses_id":"460","numSections":10},{"courses_dept":"phar","courses_id":"461","numSections":10},{"courses_dept":"phar","courses_id":"462","numSections":10},{"courses_dept":"phar","courses_id":"471","numSections":10},{"courses_dept":"phar","courses_id":"472","numSections":10},{"courses_dept":"phar","courses_id":"498","numSections":10},{"courses_dept":"phar","courses_id":"501","numSections":10},{"courses_dept":"phar","courses_id":"502","numSections":10},{"courses_dept":"phar","courses_id":"506","numSections":10},{"courses_dept":"phar","courses_id":"508","numSections":10},{"courses_dept":"phar","courses_id":"554","numSections":10},{"courses_dept":"phar","courses_id":"590","numSections":10},{"courses_dept":"phil","courses_id":"334","numSections":10},{"courses_dept":"phil","courses_id":"464","numSections":10},{"courses_dept":"phys","courses_id":"504","numSections":10},{"courses_dept":"phys","courses_id":"508","numSections":10},{"courses_dept":"plan","courses_id":"592","numSections":10},{"courses_dept":"plan","courses_id":"595","numSections":10},{"courses_dept":"poli","courses_id":"327","numSections":10},{"courses_dept":"poli","courses_id":"492","numSections":10},{"courses_dept":"pols","courses_id":"424","numSections":10},{"courses_dept":"psyc","courses_id":"301","numSections":10},{"courses_dept":"psyc","courses_id":"530","numSections":10},{"courses_dept":"psyc","courses_id":"531","numSections":10},{"courses_dept":"psyc","courses_id":"537","numSections":10},{"courses_dept":"psyc","courses_id":"541","numSections":10},{"courses_dept":"punj","courses_id":"200","numSections":10},{"courses_dept":"relg","courses_id":"201","numSections":10},{"courses_dept":"relg","courses_id":"203","numSections":10},{"courses_dept":"sans","courses_id":"102","numSections":10},{"courses_dept":"scan","courses_id":"333","numSections":10},{"courses_dept":"scan","courses_id":"414","numSections":10},{"courses_dept":"soci","courses_id":"500","numSections":10},{"courses_dept":"soci","courses_id":"501","numSections":10},{"courses_dept":"soci","courses_id":"514","numSections":10},{"courses_dept":"soil","courses_id":"501","numSections":10},{"courses_dept":"sowk","courses_id":"510","numSections":10},{"courses_dept":"sowk","courses_id":"531","numSections":10},{"courses_dept":"spph","courses_id":"510","numSections":10},{"courses_dept":"spph","courses_id":"511","numSections":10},{"courses_dept":"spph","courses_id":"533","numSections":10},{"courses_dept":"spph","courses_id":"537","numSections":10},{"courses_dept":"stat","courses_id":"443","numSections":10},{"courses_dept":"stat","courses_id":"450","numSections":10},{"courses_dept":"stat","courses_id":"460","numSections":10},{"courses_dept":"stat","courses_id":"540","numSections":10},{"courses_dept":"thtr","courses_id":"317","numSections":10},{"courses_dept":"thtr","courses_id":"330","numSections":10},{"courses_dept":"thtr","courses_id":"356","numSections":10},{"courses_dept":"thtr","courses_id":"405","numSections":10},{"courses_dept":"wood","courses_id":"120","numSections":10},{"courses_dept":"wood","courses_id":"244","numSections":10},{"courses_dept":"wood","courses_id":"280","numSections":10},{"courses_dept":"wood","courses_id":"282","numSections":10},{"courses_dept":"wood","courses_id":"290","numSections":10},{"courses_dept":"wood","courses_id":"292","numSections":10},{"courses_dept":"wood","courses_id":"330","numSections":10},{"courses_dept":"wood","courses_id":"386","numSections":10},{"courses_dept":"wood","courses_id":"440","numSections":10},{"courses_dept":"wood","courses_id":"461","numSections":10},{"courses_dept":"wood","courses_id":"464","numSections":10},{"courses_dept":"wood","courses_id":"465","numSections":10},{"courses_dept":"wood","courses_id":"474","numSections":10},{"courses_dept":"wood","courses_id":"485","numSections":10},{"courses_dept":"wood","courses_id":"487","numSections":10},{"courses_dept":"wood","courses_id":"491","numSections":10},{"courses_dept":"wood","courses_id":"492","numSections":10},{"courses_dept":"wood","courses_id":"494","numSections":10},{"courses_dept":"zool","courses_id":"503","numSections":10},{"courses_dept":"anth","courses_id":"378","numSections":11},{"courses_dept":"apbi","courses_id":"419","numSections":11},{"courses_dept":"arch","courses_id":"598","numSections":11},{"courses_dept":"arst","courses_id":"554","numSections":11},{"courses_dept":"arth","courses_id":"225","numSections":11},{"courses_dept":"astu","courses_id":"202","numSections":11},{"courses_dept":"bafi","courses_id":"541","numSections":11},{"courses_dept":"biol","courses_id":"430","numSections":11},{"courses_dept":"biol","courses_id":"431","numSections":11},{"courses_dept":"cons","courses_id":"370","numSections":11},{"courses_dept":"edcp","courses_id":"566","numSections":11},{"courses_dept":"epse","courses_id":"411","numSections":11},{"courses_dept":"epse","courses_id":"549","numSections":11},{"courses_dept":"frst","courses_id":"452","numSections":11},{"courses_dept":"hist","courses_id":"369","numSections":11},{"courses_dept":"isci","courses_id":"433","numSections":11},{"courses_dept":"japn","courses_id":"406","numSections":11},{"courses_dept":"math","courses_id":"305","numSections":11},{"courses_dept":"midw","courses_id":"205","numSections":11},{"courses_dept":"mine","courses_id":"310","numSections":11},{"courses_dept":"musc","courses_id":"101","numSections":11},{"courses_dept":"musc","courses_id":"201","numSections":11},{"courses_dept":"obst","courses_id":"549","numSections":11},{"courses_dept":"phar","courses_id":"352","numSections":11},{"courses_dept":"poli","courses_id":"110","numSections":11},{"courses_dept":"poli","courses_id":"351","numSections":11},{"courses_dept":"poli","courses_id":"461","numSections":11},{"courses_dept":"russ","courses_id":"101","numSections":11},{"courses_dept":"russ","courses_id":"102","numSections":11},{"courses_dept":"sowk","courses_id":"525","numSections":11},{"courses_dept":"sowk","courses_id":"551","numSections":11},{"courses_dept":"anat","courses_id":"392","numSections":12},{"courses_dept":"anth","courses_id":"217","numSections":12},{"courses_dept":"anth","courses_id":"241","numSections":12},{"courses_dept":"anth","courses_id":"332","numSections":12},{"courses_dept":"apbi","courses_id":"244","numSections":12},{"courses_dept":"apbi","courses_id":"260","numSections":12},{"courses_dept":"apbi","courses_id":"311","numSections":12},{"courses_dept":"apbi","courses_id":"312","numSections":12},{"courses_dept":"apbi","courses_id":"327","numSections":12},{"courses_dept":"apbi","courses_id":"342","numSections":12},{"courses_dept":"apbi","courses_id":"360","numSections":12},{"courses_dept":"apbi","courses_id":"361","numSections":12},{"courses_dept":"apbi","courses_id":"398","numSections":12},{"courses_dept":"apbi","courses_id":"401","numSections":12},{"courses_dept":"apbi","courses_id":"402","numSections":12},{"courses_dept":"apbi","courses_id":"444","numSections":12},{"courses_dept":"apbi","courses_id":"460","numSections":12},{"courses_dept":"apbi","courses_id":"495","numSections":12},{"courses_dept":"arch","courses_id":"403","numSections":12},{"courses_dept":"arch","courses_id":"404","numSections":12},{"courses_dept":"arch","courses_id":"405","numSections":12},{"courses_dept":"arch","courses_id":"411","numSections":12},{"courses_dept":"arch","courses_id":"500","numSections":12},{"courses_dept":"arch","courses_id":"504","numSections":12},{"courses_dept":"arch","courses_id":"505","numSections":12},{"courses_dept":"arch","courses_id":"511","numSections":12},{"courses_dept":"arch","courses_id":"512","numSections":12},{"courses_dept":"arch","courses_id":"513","numSections":12},{"courses_dept":"arch","courses_id":"515","numSections":12},{"courses_dept":"arch","courses_id":"517","numSections":12},{"courses_dept":"arch","courses_id":"523","numSections":12},{"courses_dept":"arch","courses_id":"531","numSections":12},{"courses_dept":"arch","courses_id":"532","numSections":12},{"courses_dept":"arch","courses_id":"533","numSections":12},{"courses_dept":"arch","courses_id":"543","numSections":12},{"courses_dept":"asia","courses_id":"100","numSections":12},{"courses_dept":"asia","courses_id":"101","numSections":12},{"courses_dept":"asia","courses_id":"250","numSections":12},{"courses_dept":"asia","courses_id":"314","numSections":12},{"courses_dept":"asia","courses_id":"315","numSections":12},{"courses_dept":"asia","courses_id":"342","numSections":12},{"courses_dept":"asia","courses_id":"352","numSections":12},{"courses_dept":"asia","courses_id":"357","numSections":12},{"courses_dept":"asia","courses_id":"456","numSections":12},{"courses_dept":"astr","courses_id":"101","numSections":12},{"courses_dept":"astr","courses_id":"102","numSections":12},{"courses_dept":"astr","courses_id":"403","numSections":12},{"courses_dept":"atsc","courses_id":"201","numSections":12},{"courses_dept":"audi","courses_id":"516","numSections":12},{"courses_dept":"ba","courses_id":"561","numSections":12},{"courses_dept":"babs","courses_id":"502","numSections":12},{"courses_dept":"baen","courses_id":"502","numSections":12},{"courses_dept":"baen","courses_id":"506","numSections":12},{"courses_dept":"bait","courses_id":"527","numSections":12},{"courses_dept":"bams","courses_id":"500","numSections":12},{"courses_dept":"bams","courses_id":"501","numSections":12},{"courses_dept":"bams","courses_id":"502","numSections":12},{"courses_dept":"bams","courses_id":"503","numSections":12},{"courses_dept":"bams","courses_id":"504","numSections":12},{"courses_dept":"bams","courses_id":"506","numSections":12},{"courses_dept":"bams","courses_id":"508","numSections":12},{"courses_dept":"bams","courses_id":"517","numSections":12},{"courses_dept":"bams","courses_id":"521","numSections":12},{"courses_dept":"bams","courses_id":"522","numSections":12},{"courses_dept":"bams","courses_id":"550","numSections":12},{"courses_dept":"bapa","courses_id":"501","numSections":12},{"courses_dept":"basm","courses_id":"550","numSections":12},{"courses_dept":"bioc","courses_id":"301","numSections":12},{"courses_dept":"bioc","courses_id":"303","numSections":12},{"courses_dept":"bioc","courses_id":"402","numSections":12},{"courses_dept":"bioc","courses_id":"403","numSections":12},{"courses_dept":"bioc","courses_id":"404","numSections":12},{"courses_dept":"bioc","courses_id":"410","numSections":12},{"courses_dept":"bioc","courses_id":"521","numSections":12},{"courses_dept":"biol","courses_id":"205","numSections":12},{"courses_dept":"biol","courses_id":"209","numSections":12},{"courses_dept":"biol","courses_id":"210","numSections":12},{"courses_dept":"biol","courses_id":"301","numSections":12},{"courses_dept":"biol","courses_id":"310","numSections":12},{"courses_dept":"biol","courses_id":"320","numSections":12},{"courses_dept":"biol","courses_id":"321","numSections":12},{"courses_dept":"biol","courses_id":"323","numSections":12},{"courses_dept":"biol","courses_id":"324","numSections":12},{"courses_dept":"biol","courses_id":"326","numSections":12},{"courses_dept":"biol","courses_id":"327","numSections":12},{"courses_dept":"biol","courses_id":"328","numSections":12},{"courses_dept":"biol","courses_id":"331","numSections":12},{"courses_dept":"biol","courses_id":"344","numSections":12},{"courses_dept":"biol","courses_id":"346","numSections":12},{"courses_dept":"biol","courses_id":"347","numSections":12},{"courses_dept":"biol","courses_id":"351","numSections":12},{"courses_dept":"biol","courses_id":"352","numSections":12},{"courses_dept":"biol","courses_id":"362","numSections":12},{"courses_dept":"biol","courses_id":"404","numSections":12},{"courses_dept":"biol","courses_id":"412","numSections":12},{"courses_dept":"biol","courses_id":"413","numSections":12},{"courses_dept":"biol","courses_id":"415","numSections":12},{"courses_dept":"biol","courses_id":"418","numSections":12},{"courses_dept":"biol","courses_id":"421","numSections":12},{"courses_dept":"biol","courses_id":"425","numSections":12},{"courses_dept":"biol","courses_id":"427","numSections":12},{"courses_dept":"biol","courses_id":"434","numSections":12},{"courses_dept":"biol","courses_id":"437","numSections":12},{"courses_dept":"biol","courses_id":"445","numSections":12},{"courses_dept":"biol","courses_id":"447","numSections":12},{"courses_dept":"biol","courses_id":"449","numSections":12},{"courses_dept":"biol","courses_id":"450","numSections":12},{"courses_dept":"biol","courses_id":"454","numSections":12},{"courses_dept":"biol","courses_id":"455","numSections":12},{"courses_dept":"biol","courses_id":"456","numSections":12},{"courses_dept":"biol","courses_id":"457","numSections":12},{"courses_dept":"biol","courses_id":"462","numSections":12},{"courses_dept":"biol","courses_id":"463","numSections":12},{"courses_dept":"biol","courses_id":"465","numSections":12},{"courses_dept":"biol","courses_id":"530","numSections":12},{"courses_dept":"bota","courses_id":"501","numSections":12},{"courses_dept":"busi","courses_id":"398","numSections":12},{"courses_dept":"ccst","courses_id":"500","numSections":12},{"courses_dept":"ceen","courses_id":"501","numSections":12},{"courses_dept":"ceen","courses_id":"523","numSections":12},{"courses_dept":"cell","courses_id":"501","numSections":12},{"courses_dept":"cell","courses_id":"503","numSections":12},{"courses_dept":"cell","courses_id":"506","numSections":12},{"courses_dept":"cell","courses_id":"507","numSections":12},{"courses_dept":"chbe","courses_id":"230","numSections":12},{"courses_dept":"chbe","courses_id":"241","numSections":12},{"courses_dept":"chbe","courses_id":"251","numSections":12},{"courses_dept":"chbe","courses_id":"262","numSections":12},{"courses_dept":"chbe","courses_id":"344","numSections":12},{"courses_dept":"chbe","courses_id":"345","numSections":12},{"courses_dept":"chbe","courses_id":"346","numSections":12},{"courses_dept":"chbe","courses_id":"351","numSections":12},{"courses_dept":"chbe","courses_id":"356","numSections":12},{"courses_dept":"chbe","courses_id":"362","numSections":12},{"courses_dept":"chbe","courses_id":"364","numSections":12},{"courses_dept":"chbe","courses_id":"365","numSections":12},{"courses_dept":"chbe","courses_id":"373","numSections":12},{"courses_dept":"chbe","courses_id":"376","numSections":12},{"courses_dept":"chbe","courses_id":"381","numSections":12},{"courses_dept":"chbe","courses_id":"453","numSections":12},{"courses_dept":"chbe","courses_id":"454","numSections":12},{"courses_dept":"chbe","courses_id":"455","numSections":12},{"courses_dept":"chbe","courses_id":"457","numSections":12},{"courses_dept":"chbe","courses_id":"459","numSections":12},{"courses_dept":"chbe","courses_id":"464","numSections":12},{"courses_dept":"chbe","courses_id":"481","numSections":12},{"courses_dept":"chbe","courses_id":"484","numSections":12},{"courses_dept":"chbe","courses_id":"485","numSections":12},{"courses_dept":"chbe","courses_id":"551","numSections":12},{"courses_dept":"chbe","courses_id":"553","numSections":12},{"courses_dept":"chbe","courses_id":"554","numSections":12},{"courses_dept":"chbe","courses_id":"575","numSections":12},{"courses_dept":"chbe","courses_id":"597","numSections":12},{"courses_dept":"chem","courses_id":"111","numSections":12},{"courses_dept":"chem","courses_id":"203","numSections":12},{"courses_dept":"chem","courses_id":"250","numSections":12},{"courses_dept":"chem","courses_id":"251","numSections":12},{"courses_dept":"chem","courses_id":"260","numSections":12},{"courses_dept":"chem","courses_id":"301","numSections":12},{"courses_dept":"chem","courses_id":"302","numSections":12},{"courses_dept":"chem","courses_id":"304","numSections":12},{"courses_dept":"chem","courses_id":"305","numSections":12},{"courses_dept":"chem","courses_id":"309","numSections":12},{"courses_dept":"chem","courses_id":"310","numSections":12},{"courses_dept":"chem","courses_id":"311","numSections":12},{"courses_dept":"chem","courses_id":"312","numSections":12},{"courses_dept":"chem","courses_id":"313","numSections":12},{"courses_dept":"chem","courses_id":"330","numSections":12},{"courses_dept":"chem","courses_id":"333","numSections":12},{"courses_dept":"chem","courses_id":"402","numSections":12},{"courses_dept":"chem","courses_id":"410","numSections":12},{"courses_dept":"chem","courses_id":"411","numSections":12},{"courses_dept":"chem","courses_id":"416","numSections":12},{"courses_dept":"chem","courses_id":"418","numSections":12},{"courses_dept":"chem","courses_id":"427","numSections":12},{"courses_dept":"chem","courses_id":"449","numSections":12},{"courses_dept":"chem","courses_id":"501","numSections":12},{"courses_dept":"chem","courses_id":"514","numSections":12},{"courses_dept":"chem","courses_id":"524","numSections":12},{"courses_dept":"chem","courses_id":"527","numSections":12},{"courses_dept":"chem","courses_id":"529","numSections":12},{"courses_dept":"chem","courses_id":"533","numSections":12},{"courses_dept":"chem","courses_id":"563","numSections":12},{"courses_dept":"chem","courses_id":"566","numSections":12},{"courses_dept":"chem","courses_id":"573","numSections":12},{"courses_dept":"chin","courses_id":"203","numSections":12},{"courses_dept":"chin","courses_id":"204","numSections":12},{"courses_dept":"chin","courses_id":"205","numSections":12},{"courses_dept":"chin","courses_id":"207","numSections":12},{"courses_dept":"chin","courses_id":"208","numSections":12},{"courses_dept":"chin","courses_id":"215","numSections":12},{"courses_dept":"chin","courses_id":"217","numSections":12},{"courses_dept":"chin","courses_id":"301","numSections":12},{"courses_dept":"chin","courses_id":"305","numSections":12},{"courses_dept":"chin","courses_id":"307","numSections":12},{"courses_dept":"chin","courses_id":"411","numSections":12},{"courses_dept":"chin","courses_id":"471","numSections":12},{"courses_dept":"chin","courses_id":"473","numSections":12},{"courses_dept":"cics","courses_id":"520","numSections":12},{"courses_dept":"cics","courses_id":"530","numSections":12},{"courses_dept":"civl","courses_id":"201","numSections":12},{"courses_dept":"civl","courses_id":"202","numSections":12},{"courses_dept":"civl","courses_id":"228","numSections":12},{"courses_dept":"civl","courses_id":"230","numSections":12},{"courses_dept":"civl","courses_id":"231","numSections":12},{"courses_dept":"civl","courses_id":"301","numSections":12},{"courses_dept":"civl","courses_id":"311","numSections":12},{"courses_dept":"civl","courses_id":"315","numSections":12},{"courses_dept":"civl","courses_id":"316","numSections":12},{"courses_dept":"civl","courses_id":"320","numSections":12},{"courses_dept":"civl","courses_id":"331","numSections":12},{"courses_dept":"civl","courses_id":"332","numSections":12},{"courses_dept":"civl","courses_id":"340","numSections":12},{"courses_dept":"civl","courses_id":"402","numSections":12},{"courses_dept":"civl","courses_id":"407","numSections":12},{"courses_dept":"civl","courses_id":"408","numSections":12},{"courses_dept":"civl","courses_id":"411","numSections":12},{"courses_dept":"civl","courses_id":"416","numSections":12},{"courses_dept":"civl","courses_id":"418","numSections":12},{"courses_dept":"civl","courses_id":"433","numSections":12},{"courses_dept":"civl","courses_id":"435","numSections":12},{"courses_dept":"civl","courses_id":"436","numSections":12},{"courses_dept":"civl","courses_id":"439","numSections":12},{"courses_dept":"civl","courses_id":"440","numSections":12},{"courses_dept":"civl","courses_id":"441","numSections":12},{"courses_dept":"civl","courses_id":"445","numSections":12},{"courses_dept":"civl","courses_id":"493","numSections":12},{"courses_dept":"civl","courses_id":"504","numSections":12},{"courses_dept":"civl","courses_id":"507","numSections":12},{"courses_dept":"civl","courses_id":"516","numSections":12},{"courses_dept":"civl","courses_id":"518","numSections":12},{"courses_dept":"civl","courses_id":"520","numSections":12},{"courses_dept":"civl","courses_id":"521","numSections":12},{"courses_dept":"civl","courses_id":"522","numSections":12},{"courses_dept":"civl","courses_id":"523","numSections":12},{"courses_dept":"civl","courses_id":"524","numSections":12},{"courses_dept":"civl","courses_id":"537","numSections":12},{"courses_dept":"civl","courses_id":"562","numSections":12},{"courses_dept":"civl","courses_id":"564","numSections":12},{"courses_dept":"civl","courses_id":"565","numSections":12},{"courses_dept":"civl","courses_id":"566","numSections":12},{"courses_dept":"civl","courses_id":"569","numSections":12},{"courses_dept":"civl","courses_id":"570","numSections":12},{"courses_dept":"civl","courses_id":"574","numSections":12},{"courses_dept":"civl","courses_id":"581","numSections":12},{"courses_dept":"civl","courses_id":"583","numSections":12},{"courses_dept":"clst","courses_id":"211","numSections":12},{"courses_dept":"clst","courses_id":"212","numSections":12},{"courses_dept":"cnps","courses_id":"524","numSections":12},{"courses_dept":"cnps","courses_id":"579","numSections":12},{"courses_dept":"cnps","courses_id":"632","numSections":12},{"courses_dept":"cnrs","courses_id":"370","numSections":12},{"courses_dept":"cohr","courses_id":"303","numSections":12},{"courses_dept":"cohr","courses_id":"305","numSections":12},{"courses_dept":"cohr","courses_id":"307","numSections":12},{"courses_dept":"comm","courses_id":"311","numSections":12},{"courses_dept":"comm","courses_id":"388","numSections":12},{"courses_dept":"comm","courses_id":"408","numSections":12},{"courses_dept":"comm","courses_id":"434","numSections":12},{"courses_dept":"comm","courses_id":"444","numSections":12},{"courses_dept":"comm","courses_id":"446","numSections":12},{"courses_dept":"comm","courses_id":"447","numSections":12},{"courses_dept":"comm","courses_id":"452","numSections":12},{"courses_dept":"comm","courses_id":"460","numSections":12},{"courses_dept":"comm","courses_id":"466","numSections":12},{"courses_dept":"comm","courses_id":"477","numSections":12},{"courses_dept":"comm","courses_id":"495","numSections":12},{"courses_dept":"comm","courses_id":"525","numSections":12},{"courses_dept":"comm","courses_id":"581","numSections":12},{"courses_dept":"comm","courses_id":"671","numSections":12},{"courses_dept":"comm","courses_id":"693","numSections":12},{"courses_dept":"cons","courses_id":"200","numSections":12},{"courses_dept":"cpsc","courses_id":"301","numSections":12},{"courses_dept":"cpsc","courses_id":"302","numSections":12},{"courses_dept":"cpsc","courses_id":"303","numSections":12},{"courses_dept":"cpsc","courses_id":"311","numSections":12},{"courses_dept":"cpsc","courses_id":"312","numSections":12},{"courses_dept":"cpsc","courses_id":"319","numSections":12},{"courses_dept":"cpsc","courses_id":"340","numSections":12},{"courses_dept":"cpsc","courses_id":"410","numSections":12},{"courses_dept":"cpsc","courses_id":"411","numSections":12},{"courses_dept":"cpsc","courses_id":"415","numSections":12},{"courses_dept":"cpsc","courses_id":"416","numSections":12},{"courses_dept":"cpsc","courses_id":"420","numSections":12},{"courses_dept":"cpsc","courses_id":"421","numSections":12},{"courses_dept":"cpsc","courses_id":"422","numSections":12},{"courses_dept":"cpsc","courses_id":"425","numSections":12},{"courses_dept":"cpsc","courses_id":"445","numSections":12},{"courses_dept":"cpsc","courses_id":"500","numSections":12},{"courses_dept":"cpsc","courses_id":"513","numSections":12},{"courses_dept":"cpsc","courses_id":"544","numSections":12},{"courses_dept":"dent","courses_id":"410","numSections":12},{"courses_dept":"dent","courses_id":"440","numSections":12},{"courses_dept":"dent","courses_id":"540","numSections":12},{"courses_dept":"dent","courses_id":"543","numSections":12},{"courses_dept":"eced","courses_id":"406","numSections":12},{"courses_dept":"econ","courses_id":"226","numSections":12},{"courses_dept":"econ","courses_id":"304","numSections":12},{"courses_dept":"econ","courses_id":"305","numSections":12},{"courses_dept":"econ","courses_id":"306","numSections":12},{"courses_dept":"econ","courses_id":"307","numSections":12},{"courses_dept":"econ","courses_id":"310","numSections":12},{"courses_dept":"econ","courses_id":"311","numSections":12},{"courses_dept":"econ","courses_id":"319","numSections":12},{"courses_dept":"econ","courses_id":"335","numSections":12},{"courses_dept":"econ","courses_id":"367","numSections":12},{"courses_dept":"econ","courses_id":"374","numSections":12},{"courses_dept":"econ","courses_id":"406","numSections":12},{"courses_dept":"econ","courses_id":"407","numSections":12},{"courses_dept":"econ","courses_id":"421","numSections":12},{"courses_dept":"econ","courses_id":"425","numSections":12},{"courses_dept":"econ","courses_id":"447","numSections":12},{"courses_dept":"econ","courses_id":"455","numSections":12},{"courses_dept":"econ","courses_id":"457","numSections":12},{"courses_dept":"econ","courses_id":"465","numSections":12},{"courses_dept":"econ","courses_id":"466","numSections":12},{"courses_dept":"econ","courses_id":"472","numSections":12},{"courses_dept":"econ","courses_id":"480","numSections":12},{"courses_dept":"econ","courses_id":"495","numSections":12},{"courses_dept":"econ","courses_id":"499","numSections":12},{"courses_dept":"econ","courses_id":"500","numSections":12},{"courses_dept":"econ","courses_id":"502","numSections":12},{"courses_dept":"econ","courses_id":"516","numSections":12},{"courses_dept":"econ","courses_id":"526","numSections":12},{"courses_dept":"econ","courses_id":"527","numSections":12},{"courses_dept":"econ","courses_id":"541","numSections":12},{"courses_dept":"econ","courses_id":"546","numSections":12},{"courses_dept":"econ","courses_id":"550","numSections":12},{"courses_dept":"econ","courses_id":"556","numSections":12},{"courses_dept":"econ","courses_id":"560","numSections":12},{"courses_dept":"econ","courses_id":"562","numSections":12},{"courses_dept":"econ","courses_id":"580","numSections":12},{"courses_dept":"econ","courses_id":"600","numSections":12},{"courses_dept":"econ","courses_id":"601","numSections":12},{"courses_dept":"econ","courses_id":"602","numSections":12},{"courses_dept":"econ","courses_id":"603","numSections":12},{"courses_dept":"econ","courses_id":"626","numSections":12},{"courses_dept":"econ","courses_id":"627","numSections":12},{"courses_dept":"econ","courses_id":"628","numSections":12},{"courses_dept":"edcp","courses_id":"377","numSections":12},{"courses_dept":"edst","courses_id":"509","numSections":12},{"courses_dept":"edst","courses_id":"518","numSections":12},{"courses_dept":"edst","courses_id":"535","numSections":12},{"courses_dept":"edst","courses_id":"575","numSections":12},{"courses_dept":"ends","courses_id":"301","numSections":12},{"courses_dept":"ends","courses_id":"302","numSections":12},{"courses_dept":"ends","courses_id":"320","numSections":12},{"courses_dept":"ends","courses_id":"401","numSections":12},{"courses_dept":"ends","courses_id":"402","numSections":12},{"courses_dept":"ends","courses_id":"420","numSections":12},{"courses_dept":"ends","courses_id":"440","numSections":12},{"courses_dept":"engl","courses_id":"210","numSections":12},{"courses_dept":"engl","courses_id":"328","numSections":12},{"courses_dept":"engl","courses_id":"340","numSections":12},{"courses_dept":"engl","courses_id":"343","numSections":12},{"courses_dept":"envr","courses_id":"300","numSections":12},{"courses_dept":"eosc","courses_id":"210","numSections":12},{"courses_dept":"eosc","courses_id":"211","numSections":12},{"courses_dept":"eosc","courses_id":"212","numSections":12},{"courses_dept":"eosc","courses_id":"220","numSections":12},{"courses_dept":"eosc","courses_id":"221","numSections":12},{"courses_dept":"eosc","courses_id":"222","numSections":12},{"courses_dept":"eosc","courses_id":"250","numSections":12},{"courses_dept":"eosc","courses_id":"270","numSections":12},{"courses_dept":"eosc","courses_id":"311","numSections":12},{"courses_dept":"eosc","courses_id":"320","numSections":12},{"courses_dept":"eosc","courses_id":"321","numSections":12},{"courses_dept":"eosc","courses_id":"322","numSections":12},{"courses_dept":"eosc","courses_id":"323","numSections":12},{"courses_dept":"eosc","courses_id":"328","numSections":12},{"courses_dept":"eosc","courses_id":"329","numSections":12},{"courses_dept":"eosc","courses_id":"330","numSections":12},{"courses_dept":"eosc","courses_id":"331","numSections":12},{"courses_dept":"eosc","courses_id":"332","numSections":12},{"courses_dept":"eosc","courses_id":"333","numSections":12},{"courses_dept":"eosc","courses_id":"350","numSections":12},{"courses_dept":"eosc","courses_id":"352","numSections":12},{"courses_dept":"eosc","courses_id":"353","numSections":12},{"courses_dept":"eosc","courses_id":"354","numSections":12},{"courses_dept":"eosc","courses_id":"372","numSections":12},{"courses_dept":"eosc","courses_id":"373","numSections":12},{"courses_dept":"eosc","courses_id":"420","numSections":12},{"courses_dept":"eosc","courses_id":"425","numSections":12},{"courses_dept":"eosc","courses_id":"428","numSections":12},{"courses_dept":"eosc","courses_id":"429","numSections":12},{"courses_dept":"eosc","courses_id":"433","numSections":12},{"courses_dept":"eosc","courses_id":"434","numSections":12},{"courses_dept":"eosc","courses_id":"454","numSections":12},{"courses_dept":"eosc","courses_id":"470","numSections":12},{"courses_dept":"eosc","courses_id":"472","numSections":12},{"courses_dept":"eosc","courses_id":"474","numSections":12},{"courses_dept":"eosc","courses_id":"512","numSections":12},{"courses_dept":"eosc","courses_id":"513","numSections":12},{"courses_dept":"eosc","courses_id":"532","numSections":12},{"courses_dept":"eosc","courses_id":"533","numSections":12},{"courses_dept":"eosc","courses_id":"535","numSections":12},{"courses_dept":"epse","courses_id":"481","numSections":12},{"courses_dept":"epse","courses_id":"550","numSections":12},{"courses_dept":"epse","courses_id":"568","numSections":12},{"courses_dept":"epse","courses_id":"584","numSections":12},{"courses_dept":"epse","courses_id":"593","numSections":12},{"courses_dept":"etec","courses_id":"533","numSections":12},{"courses_dept":"fipr","courses_id":"234","numSections":12},{"courses_dept":"fipr","courses_id":"333","numSections":12},{"courses_dept":"fipr","courses_id":"337","numSections":12},{"courses_dept":"fipr","courses_id":"338","numSections":12},{"courses_dept":"fipr","courses_id":"339","numSections":12},{"courses_dept":"fipr","courses_id":"437","numSections":12},{"courses_dept":"fish","courses_id":"500","numSections":12},{"courses_dept":"fist","courses_id":"210","numSections":12},{"courses_dept":"fist","courses_id":"300","numSections":12},{"courses_dept":"fist","courses_id":"331","numSections":12},{"courses_dept":"fnh","courses_id":"300","numSections":12},{"courses_dept":"fnh","courses_id":"301","numSections":12},{"courses_dept":"fnh","courses_id":"302","numSections":12},{"courses_dept":"fnh","courses_id":"309","numSections":12},{"courses_dept":"fnh","courses_id":"313","numSections":12},{"courses_dept":"fnh","courses_id":"325","numSections":12},{"courses_dept":"fnh","courses_id":"326","numSections":12},{"courses_dept":"fnh","courses_id":"340","numSections":12},{"courses_dept":"fnh","courses_id":"342","numSections":12},{"courses_dept":"fnh","courses_id":"351","numSections":12},{"courses_dept":"fnh","courses_id":"398","numSections":12},{"courses_dept":"fnh","courses_id":"402","numSections":12},{"courses_dept":"fnh","courses_id":"403","numSections":12},{"courses_dept":"fnh","courses_id":"425","numSections":12},{"courses_dept":"fnh","courses_id":"440","numSections":12},{"courses_dept":"fnh","courses_id":"451","numSections":12},{"courses_dept":"fnh","courses_id":"470","numSections":12},{"courses_dept":"fnh","courses_id":"471","numSections":12},{"courses_dept":"fnh","courses_id":"473","numSections":12},{"courses_dept":"fnh","courses_id":"475","numSections":12},{"courses_dept":"fnh","courses_id":"477","numSections":12},{"courses_dept":"food","courses_id":"510","numSections":12},{"courses_dept":"food","courses_id":"520","numSections":12},{"courses_dept":"food","courses_id":"522","numSections":12},{"courses_dept":"food","courses_id":"523","numSections":12},{"courses_dept":"food","courses_id":"524","numSections":12},{"courses_dept":"food","courses_id":"528","numSections":12},{"courses_dept":"fopr","courses_id":"262","numSections":12},{"courses_dept":"fopr","courses_id":"388","numSections":12},{"courses_dept":"fopr","courses_id":"459","numSections":12},{"courses_dept":"fre","courses_id":"306","numSections":12},{"courses_dept":"fre","courses_id":"340","numSections":12},{"courses_dept":"fre","courses_id":"374","numSections":12},{"courses_dept":"fre","courses_id":"385","numSections":12},{"courses_dept":"fre","courses_id":"420","numSections":12},{"courses_dept":"fren","courses_id":"224","numSections":12},{"courses_dept":"fren","courses_id":"225","numSections":12},{"courses_dept":"fren","courses_id":"330","numSections":12},{"courses_dept":"fren","courses_id":"357","numSections":12},{"courses_dept":"fren","courses_id":"370","numSections":12},{"courses_dept":"geob","courses_id":"200","numSections":12},{"courses_dept":"geob","courses_id":"204","numSections":12},{"courses_dept":"geob","courses_id":"206","numSections":12},{"courses_dept":"geob","courses_id":"207","numSections":12},{"courses_dept":"geob","courses_id":"300","numSections":12},{"courses_dept":"geob","courses_id":"305","numSections":12},{"courses_dept":"geob","courses_id":"307","numSections":12},{"courses_dept":"geob","courses_id":"308","numSections":12},{"courses_dept":"geob","courses_id":"309","numSections":12},{"courses_dept":"geob","courses_id":"370","numSections":12},{"courses_dept":"geob","courses_id":"373","numSections":12},{"courses_dept":"geob","courses_id":"500","numSections":12},{"courses_dept":"geog","courses_id":"250","numSections":12},{"courses_dept":"geog","courses_id":"312","numSections":12},{"courses_dept":"geog","courses_id":"316","numSections":12},{"courses_dept":"geog","courses_id":"318","numSections":12},{"courses_dept":"geog","courses_id":"319","numSections":12},{"courses_dept":"geog","courses_id":"321","numSections":12},{"courses_dept":"geog","courses_id":"327","numSections":12},{"courses_dept":"geog","courses_id":"329","numSections":12},{"courses_dept":"geog","courses_id":"345","numSections":12},{"courses_dept":"geog","courses_id":"353","numSections":12},{"courses_dept":"geog","courses_id":"357","numSections":12},{"courses_dept":"geog","courses_id":"362","numSections":12},{"courses_dept":"geog","courses_id":"364","numSections":12},{"courses_dept":"geog","courses_id":"391","numSections":12},{"courses_dept":"geog","courses_id":"395","numSections":12},{"courses_dept":"geog","courses_id":"412","numSections":12},{"courses_dept":"geog","courses_id":"419","numSections":12},{"courses_dept":"geog","courses_id":"423","numSections":12},{"courses_dept":"geog","courses_id":"424","numSections":12},{"courses_dept":"geog","courses_id":"426","numSections":12},{"courses_dept":"geog","courses_id":"429","numSections":12},{"courses_dept":"geog","courses_id":"457","numSections":12},{"courses_dept":"geog","courses_id":"495","numSections":12},{"courses_dept":"geog","courses_id":"497","numSections":12},{"courses_dept":"geog","courses_id":"520","numSections":12},{"courses_dept":"hist","courses_id":"235","numSections":12},{"courses_dept":"hist","courses_id":"305","numSections":12},{"courses_dept":"hist","courses_id":"325","numSections":12},{"courses_dept":"hist","courses_id":"327","numSections":12},{"courses_dept":"hist","courses_id":"328","numSections":12},{"courses_dept":"hist","courses_id":"339","numSections":12},{"courses_dept":"hist","courses_id":"370","numSections":12},{"courses_dept":"hist","courses_id":"379","numSections":12},{"courses_dept":"hist","courses_id":"425","numSections":12},{"courses_dept":"hist","courses_id":"433","numSections":12},{"courses_dept":"hist","courses_id":"449","numSections":12},{"courses_dept":"ital","courses_id":"301","numSections":12},{"courses_dept":"ital","courses_id":"302","numSections":12},{"courses_dept":"ital","courses_id":"403","numSections":12},{"courses_dept":"itst","courses_id":"231","numSections":12},{"courses_dept":"itst","courses_id":"413","numSections":12},{"courses_dept":"japn","courses_id":"408","numSections":12},{"courses_dept":"japn","courses_id":"410","numSections":12},{"courses_dept":"japn","courses_id":"416","numSections":12},{"courses_dept":"larc","courses_id":"316","numSections":12},{"courses_dept":"larc","courses_id":"431","numSections":12},{"courses_dept":"larc","courses_id":"440","numSections":12},{"courses_dept":"larc","courses_id":"501","numSections":12},{"courses_dept":"larc","courses_id":"502","numSections":12},{"courses_dept":"larc","courses_id":"503","numSections":12},{"courses_dept":"larc","courses_id":"525","numSections":12},{"courses_dept":"larc","courses_id":"531","numSections":12},{"courses_dept":"larc","courses_id":"540","numSections":12},{"courses_dept":"larc","courses_id":"551","numSections":12},{"courses_dept":"larc","courses_id":"595","numSections":12},{"courses_dept":"laso","courses_id":"204","numSections":12},{"courses_dept":"law","courses_id":"303","numSections":12},{"courses_dept":"law","courses_id":"334","numSections":12},{"courses_dept":"law","courses_id":"353","numSections":12},{"courses_dept":"law","courses_id":"374","numSections":12},{"courses_dept":"law","courses_id":"377","numSections":12},{"courses_dept":"law","courses_id":"387","numSections":12},{"courses_dept":"law","courses_id":"408","numSections":12},{"courses_dept":"law","courses_id":"410","numSections":12},{"courses_dept":"law","courses_id":"438","numSections":12},{"courses_dept":"law","courses_id":"440","numSections":12},{"courses_dept":"law","courses_id":"444","numSections":12},{"courses_dept":"law","courses_id":"448","numSections":12},{"courses_dept":"law","courses_id":"449","numSections":12},{"courses_dept":"law","courses_id":"455","numSections":12},{"courses_dept":"law","courses_id":"457","numSections":12},{"courses_dept":"law","courses_id":"461","numSections":12},{"courses_dept":"law","courses_id":"462","numSections":12},{"courses_dept":"law","courses_id":"466","numSections":12},{"courses_dept":"law","courses_id":"470","numSections":12},{"courses_dept":"law","courses_id":"473","numSections":12},{"courses_dept":"lfs","courses_id":"100","numSections":12},{"courses_dept":"lfs","courses_id":"400","numSections":12},{"courses_dept":"lfs","courses_id":"450","numSections":12},{"courses_dept":"libr","courses_id":"512","numSections":12},{"courses_dept":"libr","courses_id":"516","numSections":12},{"courses_dept":"libr","courses_id":"527","numSections":12},{"courses_dept":"libr","courses_id":"528","numSections":12},{"courses_dept":"libr","courses_id":"555","numSections":12},{"courses_dept":"libr","courses_id":"587","numSections":12},{"courses_dept":"ling","courses_id":"209","numSections":12},{"courses_dept":"ling","courses_id":"319","numSections":12},{"courses_dept":"ling","courses_id":"327","numSections":12},{"courses_dept":"ling","courses_id":"431","numSections":12},{"courses_dept":"ling","courses_id":"432","numSections":12},{"courses_dept":"ling","courses_id":"445","numSections":12},{"courses_dept":"ling","courses_id":"451","numSections":12},{"courses_dept":"ling","courses_id":"452","numSections":12},{"courses_dept":"ling","courses_id":"508","numSections":12},{"courses_dept":"ling","courses_id":"510","numSections":12},{"courses_dept":"ling","courses_id":"518","numSections":12},{"courses_dept":"ling","courses_id":"520","numSections":12},{"courses_dept":"ling","courses_id":"525","numSections":12},{"courses_dept":"ling","courses_id":"531","numSections":12},{"courses_dept":"lled","courses_id":"201","numSections":12},{"courses_dept":"math","courses_id":"120","numSections":12},{"courses_dept":"math","courses_id":"121","numSections":12},{"courses_dept":"math","courses_id":"190","numSections":12},{"courses_dept":"math","courses_id":"210","numSections":12},{"courses_dept":"math","courses_id":"226","numSections":12},{"courses_dept":"math","courses_id":"227","numSections":12},{"courses_dept":"math","courses_id":"264","numSections":12},{"courses_dept":"math","courses_id":"301","numSections":12},{"courses_dept":"math","courses_id":"303","numSections":12},{"courses_dept":"math","courses_id":"308","numSections":12},{"courses_dept":"math","courses_id":"318","numSections":12},{"courses_dept":"math","courses_id":"320","numSections":12},{"courses_dept":"math","courses_id":"321","numSections":12},{"courses_dept":"math","courses_id":"322","numSections":12},{"courses_dept":"math","courses_id":"345","numSections":12},{"courses_dept":"math","courses_id":"401","numSections":12},{"courses_dept":"math","courses_id":"405","numSections":12},{"courses_dept":"math","courses_id":"414","numSections":12},{"courses_dept":"math","courses_id":"418","numSections":12},{"courses_dept":"math","courses_id":"420","numSections":12},{"courses_dept":"math","courses_id":"422","numSections":12},{"courses_dept":"math","courses_id":"437","numSections":12},{"courses_dept":"math","courses_id":"507","numSections":12},{"courses_dept":"math","courses_id":"510","numSections":12},{"courses_dept":"math","courses_id":"516","numSections":12},{"courses_dept":"math","courses_id":"521","numSections":12},{"courses_dept":"math","courses_id":"525","numSections":12},{"courses_dept":"math","courses_id":"544","numSections":12},{"courses_dept":"math","courses_id":"545","numSections":12},{"courses_dept":"math","courses_id":"550","numSections":12},{"courses_dept":"mech","courses_id":"220","numSections":12},{"courses_dept":"mech","courses_id":"221","numSections":12},{"courses_dept":"mech","courses_id":"222","numSections":12},{"courses_dept":"mech","courses_id":"223","numSections":12},{"courses_dept":"mech","courses_id":"280","numSections":12},{"courses_dept":"mech","courses_id":"305","numSections":12},{"courses_dept":"mech","courses_id":"306","numSections":12},{"courses_dept":"mech","courses_id":"327","numSections":12},{"courses_dept":"mech","courses_id":"328","numSections":12},{"courses_dept":"mech","courses_id":"329","numSections":12},{"courses_dept":"mech","courses_id":"366","numSections":12},{"courses_dept":"mech","courses_id":"368","numSections":12},{"courses_dept":"mech","courses_id":"380","numSections":12},{"courses_dept":"mech","courses_id":"386","numSections":12},{"courses_dept":"mech","courses_id":"392","numSections":12},{"courses_dept":"mech","courses_id":"405","numSections":12},{"courses_dept":"mech","courses_id":"420","numSections":12},{"courses_dept":"mech","courses_id":"421","numSections":12},{"courses_dept":"mech","courses_id":"436","numSections":12},{"courses_dept":"mech","courses_id":"457","numSections":12},{"courses_dept":"mech","courses_id":"458","numSections":12},{"courses_dept":"mech","courses_id":"464","numSections":12},{"courses_dept":"mech","courses_id":"466","numSections":12},{"courses_dept":"mech","courses_id":"467","numSections":12},{"courses_dept":"mech","courses_id":"473","numSections":12},{"courses_dept":"mech","courses_id":"479","numSections":12},{"courses_dept":"mech","courses_id":"485","numSections":12},{"courses_dept":"mech","courses_id":"489","numSections":12},{"courses_dept":"mech","courses_id":"491","numSections":12},{"courses_dept":"mech","courses_id":"505","numSections":12},{"courses_dept":"mech","courses_id":"510","numSections":12},{"courses_dept":"mech","courses_id":"520","numSections":12},{"courses_dept":"mech","courses_id":"555","numSections":12},{"courses_dept":"mech","courses_id":"582","numSections":12},{"courses_dept":"mech","courses_id":"597","numSections":12},{"courses_dept":"medg","courses_id":"419","numSections":12},{"courses_dept":"medg","courses_id":"420","numSections":12},{"courses_dept":"medg","courses_id":"421","numSections":12},{"courses_dept":"medg","courses_id":"505","numSections":12},{"courses_dept":"medg","courses_id":"520","numSections":12},{"courses_dept":"medg","courses_id":"521","numSections":12},{"courses_dept":"medg","courses_id":"530","numSections":12},{"courses_dept":"medg","courses_id":"535","numSections":12},{"courses_dept":"medg","courses_id":"545","numSections":12},{"courses_dept":"medg","courses_id":"550","numSections":12},{"courses_dept":"medg","courses_id":"575","numSections":12},{"courses_dept":"medi","courses_id":"501","numSections":12},{"courses_dept":"medi","courses_id":"502","numSections":12},{"courses_dept":"medi","courses_id":"560","numSections":12},{"courses_dept":"micb","courses_id":"203","numSections":12},{"courses_dept":"micb","courses_id":"302","numSections":12},{"courses_dept":"micb","courses_id":"306","numSections":12},{"courses_dept":"micb","courses_id":"322","numSections":12},{"courses_dept":"micb","courses_id":"323","numSections":12},{"courses_dept":"micb","courses_id":"353","numSections":12},{"courses_dept":"micb","courses_id":"402","numSections":12},{"courses_dept":"micb","courses_id":"405","numSections":12},{"courses_dept":"micb","courses_id":"406","numSections":12},{"courses_dept":"micb","courses_id":"407","numSections":12},{"courses_dept":"micb","courses_id":"412","numSections":12},{"courses_dept":"micb","courses_id":"418","numSections":12},{"courses_dept":"micb","courses_id":"421","numSections":12},{"courses_dept":"micb","courses_id":"447","numSections":12},{"courses_dept":"micb","courses_id":"502","numSections":12},{"courses_dept":"micb","courses_id":"507","numSections":12},{"courses_dept":"mine","courses_id":"224","numSections":12},{"courses_dept":"mine","courses_id":"291","numSections":12},{"courses_dept":"mine","courses_id":"292","numSections":12},{"courses_dept":"mine","courses_id":"302","numSections":12},{"courses_dept":"mine","courses_id":"303","numSections":12},{"courses_dept":"mine","courses_id":"304","numSections":12},{"courses_dept":"mine","courses_id":"331","numSections":12},{"courses_dept":"mine","courses_id":"333","numSections":12},{"courses_dept":"mine","courses_id":"402","numSections":12},{"courses_dept":"mine","courses_id":"403","numSections":12},{"courses_dept":"mine","courses_id":"404","numSections":12},{"courses_dept":"mine","courses_id":"432","numSections":12},{"courses_dept":"mine","courses_id":"434","numSections":12},{"courses_dept":"mine","courses_id":"462","numSections":12},{"courses_dept":"mine","courses_id":"480","numSections":12},{"courses_dept":"mine","courses_id":"482","numSections":12},{"courses_dept":"mine","courses_id":"491","numSections":12},{"courses_dept":"mine","courses_id":"493","numSections":12},{"courses_dept":"mine","courses_id":"554","numSections":12},{"courses_dept":"mtrl","courses_id":"250","numSections":12},{"courses_dept":"mtrl","courses_id":"252","numSections":12},{"courses_dept":"mtrl","courses_id":"263","numSections":12},{"courses_dept":"mtrl","courses_id":"280","numSections":12},{"courses_dept":"mtrl","courses_id":"350","numSections":12},{"courses_dept":"mtrl","courses_id":"358","numSections":12},{"courses_dept":"mtrl","courses_id":"361","numSections":12},{"courses_dept":"mtrl","courses_id":"363","numSections":12},{"courses_dept":"mtrl","courses_id":"365","numSections":12},{"courses_dept":"mtrl","courses_id":"378","numSections":12},{"courses_dept":"mtrl","courses_id":"381","numSections":12},{"courses_dept":"mtrl","courses_id":"382","numSections":12},{"courses_dept":"mtrl","courses_id":"394","numSections":12},{"courses_dept":"mtrl","courses_id":"442","numSections":12},{"courses_dept":"mtrl","courses_id":"451","numSections":12},{"courses_dept":"mtrl","courses_id":"455","numSections":12},{"courses_dept":"mtrl","courses_id":"458","numSections":12},{"courses_dept":"mtrl","courses_id":"466","numSections":12},{"courses_dept":"mtrl","courses_id":"467","numSections":12},{"courses_dept":"mtrl","courses_id":"471","numSections":12},{"courses_dept":"mtrl","courses_id":"475","numSections":12},{"courses_dept":"mtrl","courses_id":"478","numSections":12},{"courses_dept":"mtrl","courses_id":"486","numSections":12},{"courses_dept":"mtrl","courses_id":"489","numSections":12},{"courses_dept":"mtrl","courses_id":"494","numSections":12},{"courses_dept":"mtrl","courses_id":"495","numSections":12},{"courses_dept":"musc","courses_id":"100","numSections":12},{"courses_dept":"musc","courses_id":"112","numSections":12},{"courses_dept":"musc","courses_id":"121","numSections":12},{"courses_dept":"musc","courses_id":"122","numSections":12},{"courses_dept":"musc","courses_id":"131","numSections":12},{"courses_dept":"musc","courses_id":"135","numSections":12},{"courses_dept":"musc","courses_id":"149","numSections":12},{"courses_dept":"musc","courses_id":"163","numSections":12},{"courses_dept":"musc","courses_id":"167","numSections":12},{"courses_dept":"musc","courses_id":"170","numSections":12},{"courses_dept":"musc","courses_id":"200","numSections":12},{"courses_dept":"musc","courses_id":"220","numSections":12},{"courses_dept":"musc","courses_id":"221","numSections":12},{"courses_dept":"musc","courses_id":"235","numSections":12},{"courses_dept":"musc","courses_id":"309","numSections":12},{"courses_dept":"musc","courses_id":"310","numSections":12},{"courses_dept":"musc","courses_id":"313","numSections":12},{"courses_dept":"musc","courses_id":"320","numSections":12},{"courses_dept":"musc","courses_id":"336","numSections":12},{"courses_dept":"musc","courses_id":"436","numSections":12},{"courses_dept":"musc","courses_id":"529","numSections":12},{"courses_dept":"musc","courses_id":"553","numSections":12},{"courses_dept":"musc","courses_id":"557","numSections":12},{"courses_dept":"nest","courses_id":"303","numSections":12},{"courses_dept":"nest","courses_id":"304","numSections":12},{"courses_dept":"nrsc","courses_id":"500","numSections":12},{"courses_dept":"nrsc","courses_id":"501","numSections":12},{"courses_dept":"nurs","courses_id":"596","numSections":12},{"courses_dept":"obst","courses_id":"506","numSections":12},{"courses_dept":"onco","courses_id":"502","numSections":12},{"courses_dept":"path","courses_id":"300","numSections":12},{"courses_dept":"path","courses_id":"301","numSections":12},{"courses_dept":"path","courses_id":"303","numSections":12},{"courses_dept":"path","courses_id":"304","numSections":12},{"courses_dept":"path","courses_id":"305","numSections":12},{"courses_dept":"path","courses_id":"306","numSections":12},{"courses_dept":"path","courses_id":"327","numSections":12},{"courses_dept":"path","courses_id":"375","numSections":12},{"courses_dept":"path","courses_id":"402","numSections":12},{"courses_dept":"path","courses_id":"404","numSections":12},{"courses_dept":"path","courses_id":"405","numSections":12},{"courses_dept":"path","courses_id":"406","numSections":12},{"courses_dept":"path","courses_id":"407","numSections":12},{"courses_dept":"path","courses_id":"408","numSections":12},{"courses_dept":"path","courses_id":"415","numSections":12},{"courses_dept":"path","courses_id":"427","numSections":12},{"courses_dept":"path","courses_id":"477","numSections":12},{"courses_dept":"path","courses_id":"547","numSections":12},{"courses_dept":"pcth","courses_id":"300","numSections":12},{"courses_dept":"pcth","courses_id":"302","numSections":12},{"courses_dept":"pcth","courses_id":"305","numSections":12},{"courses_dept":"pcth","courses_id":"325","numSections":12},{"courses_dept":"pcth","courses_id":"400","numSections":12},{"courses_dept":"pcth","courses_id":"402","numSections":12},{"courses_dept":"pcth","courses_id":"404","numSections":12},{"courses_dept":"phar","courses_id":"435","numSections":12},{"courses_dept":"phys","courses_id":"108","numSections":12},{"courses_dept":"phys","courses_id":"200","numSections":12},{"courses_dept":"phys","courses_id":"203","numSections":12},{"courses_dept":"phys","courses_id":"210","numSections":12},{"courses_dept":"phys","courses_id":"216","numSections":12},{"courses_dept":"phys","courses_id":"301","numSections":12},{"courses_dept":"phys","courses_id":"305","numSections":12},{"courses_dept":"phys","courses_id":"309","numSections":12},{"courses_dept":"phys","courses_id":"312","numSections":12},{"courses_dept":"phys","courses_id":"319","numSections":12},{"courses_dept":"phys","courses_id":"341","numSections":12},{"courses_dept":"phys","courses_id":"348","numSections":12},{"courses_dept":"phys","courses_id":"350","numSections":12},{"courses_dept":"phys","courses_id":"400","numSections":12},{"courses_dept":"phys","courses_id":"401","numSections":12},{"courses_dept":"phys","courses_id":"402","numSections":12},{"courses_dept":"phys","courses_id":"404","numSections":12},{"courses_dept":"phys","courses_id":"405","numSections":12},{"courses_dept":"phys","courses_id":"407","numSections":12},{"courses_dept":"phys","courses_id":"410","numSections":12},{"courses_dept":"phys","courses_id":"449","numSections":12},{"courses_dept":"phys","courses_id":"473","numSections":12},{"courses_dept":"phys","courses_id":"474","numSections":12},{"courses_dept":"phys","courses_id":"500","numSections":12},{"courses_dept":"phys","courses_id":"501","numSections":12},{"courses_dept":"phys","courses_id":"502","numSections":12},{"courses_dept":"phys","courses_id":"516","numSections":12},{"courses_dept":"phys","courses_id":"526","numSections":12},{"courses_dept":"phys","courses_id":"534","numSections":12},{"courses_dept":"phys","courses_id":"536","numSections":12},{"courses_dept":"phys","courses_id":"539","numSections":12},{"courses_dept":"phys","courses_id":"540","numSections":12},{"courses_dept":"phys","courses_id":"545","numSections":12},{"courses_dept":"plan","courses_id":"561","numSections":12},{"courses_dept":"plan","courses_id":"580","numSections":12},{"courses_dept":"plan","courses_id":"603","numSections":12},{"courses_dept":"poli","courses_id":"309","numSections":12},{"courses_dept":"poli","courses_id":"390","numSections":12},{"courses_dept":"psyc","courses_id":"260","numSections":12},{"courses_dept":"psyc","courses_id":"336","numSections":12},{"courses_dept":"psyc","courses_id":"349","numSections":12},{"courses_dept":"psyc","courses_id":"359","numSections":12},{"courses_dept":"psyc","courses_id":"360","numSections":12},{"courses_dept":"psyc","courses_id":"361","numSections":12},{"courses_dept":"psyc","courses_id":"365","numSections":12},{"courses_dept":"psyc","courses_id":"366","numSections":12},{"courses_dept":"psyc","courses_id":"368","numSections":12},{"courses_dept":"psyc","courses_id":"449","numSections":12},{"courses_dept":"psyc","courses_id":"460","numSections":12},{"courses_dept":"psyc","courses_id":"462","numSections":12},{"courses_dept":"psyc","courses_id":"560","numSections":12},{"courses_dept":"rgla","courses_id":"371","numSections":12},{"courses_dept":"rhsc","courses_id":"500","numSections":12},{"courses_dept":"rhsc","courses_id":"502","numSections":12},{"courses_dept":"rsot","courses_id":"511","numSections":12},{"courses_dept":"rsot","courses_id":"513","numSections":12},{"courses_dept":"rsot","courses_id":"515","numSections":12},{"courses_dept":"rsot","courses_id":"519","numSections":12},{"courses_dept":"rsot","courses_id":"525","numSections":12},{"courses_dept":"rsot","courses_id":"527","numSections":12},{"courses_dept":"rsot","courses_id":"545","numSections":12},{"courses_dept":"rsot","courses_id":"547","numSections":12},{"courses_dept":"rsot","courses_id":"549","numSections":12},{"courses_dept":"rsot","courses_id":"551","numSections":12},{"courses_dept":"rsot","courses_id":"553","numSections":12},{"courses_dept":"russ","courses_id":"206","numSections":12},{"courses_dept":"russ","courses_id":"207","numSections":12},{"courses_dept":"russ","courses_id":"300","numSections":12},{"courses_dept":"russ","courses_id":"400","numSections":12},{"courses_dept":"soci","courses_id":"502","numSections":12},{"courses_dept":"soci","courses_id":"503","numSections":12},{"courses_dept":"sowk","courses_id":"201","numSections":12},{"courses_dept":"sowk","courses_id":"305","numSections":12},{"courses_dept":"sowk","courses_id":"320","numSections":12},{"courses_dept":"sowk","courses_id":"335","numSections":12},{"courses_dept":"sowk","courses_id":"337","numSections":12},{"courses_dept":"sowk","courses_id":"400","numSections":12},{"courses_dept":"sowk","courses_id":"501","numSections":12},{"courses_dept":"sowk","courses_id":"502","numSections":12},{"courses_dept":"sowk","courses_id":"505","numSections":12},{"courses_dept":"sowk","courses_id":"521","numSections":12},{"courses_dept":"span","courses_id":"357","numSections":12},{"courses_dept":"span","courses_id":"358","numSections":12},{"courses_dept":"spha","courses_id":"501","numSections":12},{"courses_dept":"spha","courses_id":"502","numSections":12},{"courses_dept":"spha","courses_id":"503","numSections":12},{"courses_dept":"spha","courses_id":"510","numSections":12},{"courses_dept":"spha","courses_id":"511","numSections":12},{"courses_dept":"spha","courses_id":"521","numSections":12},{"courses_dept":"spha","courses_id":"522","numSections":12},{"courses_dept":"spha","courses_id":"531","numSections":12},{"courses_dept":"spha","courses_id":"532","numSections":12},{"courses_dept":"spha","courses_id":"542","numSections":12},{"courses_dept":"spha","courses_id":"543","numSections":12},{"courses_dept":"spha","courses_id":"551","numSections":12},{"courses_dept":"spha","courses_id":"552","numSections":12},{"courses_dept":"spha","courses_id":"553","numSections":12},{"courses_dept":"spha","courses_id":"554","numSections":12},{"courses_dept":"spha","courses_id":"555","numSections":12},{"courses_dept":"spha","courses_id":"556","numSections":12},{"courses_dept":"spha","courses_id":"557","numSections":12},{"courses_dept":"spha","courses_id":"562","numSections":12},{"courses_dept":"spph","courses_id":"504","numSections":12},{"courses_dept":"spph","courses_id":"505","numSections":12},{"courses_dept":"spph","courses_id":"512","numSections":12},{"courses_dept":"spph","courses_id":"513","numSections":12},{"courses_dept":"spph","courses_id":"516","numSections":12},{"courses_dept":"spph","courses_id":"523","numSections":12},{"courses_dept":"spph","courses_id":"536","numSections":12},{"courses_dept":"spph","courses_id":"541","numSections":12},{"courses_dept":"spph","courses_id":"542","numSections":12},{"courses_dept":"stat","courses_id":"344","numSections":12},{"courses_dept":"stat","courses_id":"404","numSections":12},{"courses_dept":"stat","courses_id":"560","numSections":12},{"courses_dept":"stat","courses_id":"561","numSections":12},{"courses_dept":"surg","courses_id":"500","numSections":12},{"courses_dept":"thtr","courses_id":"271","numSections":12},{"courses_dept":"thtr","courses_id":"272","numSections":12},{"courses_dept":"thtr","courses_id":"273","numSections":12},{"courses_dept":"thtr","courses_id":"274","numSections":12},{"courses_dept":"thtr","courses_id":"306","numSections":12},{"courses_dept":"thtr","courses_id":"308","numSections":12},{"courses_dept":"thtr","courses_id":"320","numSections":12},{"courses_dept":"thtr","courses_id":"350","numSections":12},{"courses_dept":"thtr","courses_id":"352","numSections":12},{"courses_dept":"thtr","courses_id":"354","numSections":12},{"courses_dept":"thtr","courses_id":"371","numSections":12},{"courses_dept":"thtr","courses_id":"372","numSections":12},{"courses_dept":"thtr","courses_id":"373","numSections":12},{"courses_dept":"thtr","courses_id":"374","numSections":12},{"courses_dept":"thtr","courses_id":"406","numSections":12},{"courses_dept":"thtr","courses_id":"420","numSections":12},{"courses_dept":"thtr","courses_id":"445","numSections":12},{"courses_dept":"thtr","courses_id":"471","numSections":12},{"courses_dept":"thtr","courses_id":"472","numSections":12},{"courses_dept":"thtr","courses_id":"473","numSections":12},{"courses_dept":"thtr","courses_id":"474","numSections":12},{"courses_dept":"urst","courses_id":"200","numSections":12},{"courses_dept":"urst","courses_id":"400","numSections":12},{"courses_dept":"visa","courses_id":"351","numSections":12},{"courses_dept":"visa","courses_id":"380","numSections":12},{"courses_dept":"visa","courses_id":"381","numSections":12},{"courses_dept":"visa","courses_id":"480","numSections":12},{"courses_dept":"visa","courses_id":"481","numSections":12},{"courses_dept":"visa","courses_id":"581","numSections":12},{"courses_dept":"visa","courses_id":"582","numSections":12},{"courses_dept":"arch","courses_id":"437","numSections":13},{"courses_dept":"arch","courses_id":"541","numSections":13},{"courses_dept":"arth","courses_id":"226","numSections":13},{"courses_dept":"ba","courses_id":"541","numSections":13},{"courses_dept":"bafi","courses_id":"513","numSections":13},{"courses_dept":"bait","courses_id":"511","numSections":13},{"courses_dept":"bala","courses_id":"503","numSections":13},{"courses_dept":"bama","courses_id":"515","numSections":13},{"courses_dept":"biol","courses_id":"325","numSections":13},{"courses_dept":"biol","courses_id":"341","numSections":13},{"courses_dept":"biol","courses_id":"441","numSections":13},{"courses_dept":"cens","courses_id":"201","numSections":13},{"courses_dept":"chbe","courses_id":"456","numSections":13},{"courses_dept":"chbe","courses_id":"474","numSections":13},{"courses_dept":"chin","courses_id":"201","numSections":13},{"courses_dept":"civl","courses_id":"406","numSections":13},{"courses_dept":"civl","courses_id":"410","numSections":13},{"courses_dept":"civl","courses_id":"430","numSections":13},{"courses_dept":"cnps","courses_id":"504","numSections":13},{"courses_dept":"cpsc","courses_id":"344","numSections":13},{"courses_dept":"dent","courses_id":"420","numSections":13},{"courses_dept":"dent","courses_id":"575","numSections":13},{"courses_dept":"eosc","courses_id":"223","numSections":13},{"courses_dept":"epse","courses_id":"534","numSections":13},{"courses_dept":"fopr","courses_id":"362","numSections":13},{"courses_dept":"geog","courses_id":"328","numSections":13},{"courses_dept":"geog","courses_id":"371","numSections":13},{"courses_dept":"geog","courses_id":"410","numSections":13},{"courses_dept":"grsj","courses_id":"300","numSections":13},{"courses_dept":"hist","courses_id":"105","numSections":13},{"courses_dept":"kin","courses_id":"151","numSections":13},{"courses_dept":"kin","courses_id":"499","numSections":13},{"courses_dept":"lled","courses_id":"210","numSections":13},{"courses_dept":"lled","courses_id":"391","numSections":13},{"courses_dept":"mech","courses_id":"326","numSections":13},{"courses_dept":"mech","courses_id":"431","numSections":13},{"courses_dept":"musc","courses_id":"312","numSections":13},{"courses_dept":"nurs","courses_id":"540","numSections":13},{"courses_dept":"path","courses_id":"635","numSections":13},{"courses_dept":"pers","courses_id":"100","numSections":13},{"courses_dept":"phar","courses_id":"548","numSections":13},{"courses_dept":"plan","courses_id":"425","numSections":13},{"courses_dept":"rhsc","courses_id":"587","numSections":13},{"courses_dept":"sowk","courses_id":"503","numSections":13},{"courses_dept":"span","courses_id":"364","numSections":13},{"courses_dept":"spph","courses_id":"522","numSections":13},{"courses_dept":"thtr","courses_id":"120","numSections":13},{"courses_dept":"visa","courses_id":"311","numSections":13},{"courses_dept":"visa","courses_id":"331","numSections":13},{"courses_dept":"apbi","courses_id":"314","numSections":14},{"courses_dept":"apbi","courses_id":"315","numSections":14},{"courses_dept":"ba","courses_id":"513","numSections":14},{"courses_dept":"babs","courses_id":"550","numSections":14},{"courses_dept":"bafi","courses_id":"532","numSections":14},{"courses_dept":"bama","courses_id":"503","numSections":14},{"courses_dept":"bioc","courses_id":"420","numSections":14},{"courses_dept":"chin","courses_id":"218","numSections":14},{"courses_dept":"civl","courses_id":"403","numSections":14},{"courses_dept":"civl","courses_id":"526","numSections":14},{"courses_dept":"comm","courses_id":"431","numSections":14},{"courses_dept":"comm","courses_id":"436","numSections":14},{"courses_dept":"comm","courses_id":"437","numSections":14},{"courses_dept":"comm","courses_id":"438","numSections":14},{"courses_dept":"comm","courses_id":"439","numSections":14},{"courses_dept":"comm","courses_id":"458","numSections":14},{"courses_dept":"cpsc","courses_id":"589","numSections":14},{"courses_dept":"crwr","courses_id":"206","numSections":14},{"courses_dept":"econ","courses_id":"255","numSections":14},{"courses_dept":"econ","courses_id":"334","numSections":14},{"courses_dept":"econ","courses_id":"339","numSections":14},{"courses_dept":"educ","courses_id":"140","numSections":14},{"courses_dept":"epse","courses_id":"507","numSections":14},{"courses_dept":"fist","courses_id":"220","numSections":14},{"courses_dept":"fren","courses_id":"223","numSections":14},{"courses_dept":"fren","courses_id":"343","numSections":14},{"courses_dept":"geog","courses_id":"281","numSections":14},{"courses_dept":"hist","courses_id":"317","numSections":14},{"courses_dept":"hist","courses_id":"326","numSections":14},{"courses_dept":"law","courses_id":"437","numSections":14},{"courses_dept":"law","courses_id":"443","numSections":14},{"courses_dept":"libr","courses_id":"557","numSections":14},{"courses_dept":"lled","courses_id":"220","numSections":14},{"courses_dept":"lled","courses_id":"462","numSections":14},{"courses_dept":"lled","courses_id":"601","numSections":14},{"courses_dept":"mech","courses_id":"225","numSections":14},{"courses_dept":"micb","courses_id":"401","numSections":14},{"courses_dept":"mine","courses_id":"698","numSections":14},{"courses_dept":"musc","courses_id":"120","numSections":14},{"courses_dept":"path","courses_id":"467","numSections":14},{"courses_dept":"path","courses_id":"535","numSections":14},{"courses_dept":"phys","courses_id":"107","numSections":14},{"courses_dept":"phys","courses_id":"408","numSections":14},{"courses_dept":"psyc","courses_id":"358","numSections":14},{"courses_dept":"russ","courses_id":"200","numSections":14},{"courses_dept":"soci","courses_id":"444","numSections":14},{"courses_dept":"sowk","courses_id":"200","numSections":14},{"courses_dept":"sowk","courses_id":"522","numSections":14},{"courses_dept":"span","courses_id":"402","numSections":14},{"courses_dept":"spha","courses_id":"563","numSections":14},{"courses_dept":"spph","courses_id":"520","numSections":14},{"courses_dept":"visa","courses_id":"310","numSections":14},{"courses_dept":"anth","courses_id":"227","numSections":15},{"courses_dept":"apsc","courses_id":"278","numSections":15},{"courses_dept":"apsc","courses_id":"450","numSections":15},{"courses_dept":"arst","courses_id":"570","numSections":15},{"courses_dept":"arth","courses_id":"300","numSections":15},{"courses_dept":"astr","courses_id":"310","numSections":15},{"courses_dept":"astr","courses_id":"311","numSections":15},{"courses_dept":"ba","courses_id":"562","numSections":15},{"courses_dept":"bafi","courses_id":"503","numSections":15},{"courses_dept":"bait","courses_id":"510","numSections":15},{"courses_dept":"basc","courses_id":"523","numSections":15},{"courses_dept":"bioc","courses_id":"530","numSections":15},{"courses_dept":"clst","courses_id":"204","numSections":15},{"courses_dept":"cogs","courses_id":"200","numSections":15},{"courses_dept":"cogs","courses_id":"300","numSections":15},{"courses_dept":"cogs","courses_id":"303","numSections":15},{"courses_dept":"cogs","courses_id":"401","numSections":15},{"courses_dept":"comm","courses_id":"482","numSections":15},{"courses_dept":"dhyg","courses_id":"400","numSections":15},{"courses_dept":"dhyg","courses_id":"412","numSections":15},{"courses_dept":"eced","courses_id":"439","numSections":15},{"courses_dept":"educ","courses_id":"240","numSections":15},{"courses_dept":"engl","courses_id":"489","numSections":15},{"courses_dept":"epse","courses_id":"501","numSections":15},{"courses_dept":"epse","courses_id":"553","numSections":15},{"courses_dept":"fmst","courses_id":"238","numSections":15},{"courses_dept":"fnh","courses_id":"370","numSections":15},{"courses_dept":"frst","courses_id":"232","numSections":15},{"courses_dept":"germ","courses_id":"302","numSections":15},{"courses_dept":"jrnl","courses_id":"533","numSections":15},{"courses_dept":"kin","courses_id":"161","numSections":15},{"courses_dept":"kin","courses_id":"303","numSections":15},{"courses_dept":"kin","courses_id":"351","numSections":15},{"courses_dept":"kin","courses_id":"389","numSections":15},{"courses_dept":"korn","courses_id":"200","numSections":15},{"courses_dept":"law","courses_id":"316","numSections":15},{"courses_dept":"lfs","courses_id":"252","numSections":15},{"courses_dept":"lled","courses_id":"221","numSections":15},{"courses_dept":"lled","courses_id":"452","numSections":15},{"courses_dept":"lled","courses_id":"459","numSections":15},{"courses_dept":"lled","courses_id":"526","numSections":15},{"courses_dept":"math","courses_id":"223","numSections":15},{"courses_dept":"math","courses_id":"342","numSections":15},{"courses_dept":"mech","courses_id":"224","numSections":15},{"courses_dept":"musc","courses_id":"349","numSections":15},{"courses_dept":"nurs","courses_id":"552","numSections":15},{"courses_dept":"path","courses_id":"451","numSections":15},{"courses_dept":"phar","courses_id":"400","numSections":15},{"courses_dept":"phar","courses_id":"499","numSections":15},{"courses_dept":"poli","courses_id":"332","numSections":15},{"courses_dept":"sowk","courses_id":"405","numSections":15},{"courses_dept":"sowk","courses_id":"550","numSections":15},{"courses_dept":"span","courses_id":"365","numSections":15},{"courses_dept":"stat","courses_id":"203","numSections":15},{"courses_dept":"stat","courses_id":"305","numSections":15},{"courses_dept":"stat","courses_id":"306","numSections":15},{"courses_dept":"surg","courses_id":"510","numSections":15},{"courses_dept":"visa","courses_id":"321","numSections":15},{"courses_dept":"visa","courses_id":"341","numSections":15},{"courses_dept":"apbi","courses_id":"490","numSections":16},{"courses_dept":"arth","courses_id":"341","numSections":16},{"courses_dept":"audi","courses_id":"576","numSections":16},{"courses_dept":"biol","courses_id":"260","numSections":16},{"courses_dept":"biol","courses_id":"337","numSections":16},{"courses_dept":"biol","courses_id":"458","numSections":16},{"courses_dept":"bmeg","courses_id":"599","numSections":16},{"courses_dept":"busi","courses_id":"441","numSections":16},{"courses_dept":"chin","courses_id":"211","numSections":16},{"courses_dept":"chin","courses_id":"213","numSections":16},{"courses_dept":"chin","courses_id":"214","numSections":16},{"courses_dept":"cpsc","courses_id":"430","numSections":16},{"courses_dept":"dent","courses_id":"430","numSections":16},{"courses_dept":"eced","courses_id":"421","numSections":16},{"courses_dept":"edcp","courses_id":"492","numSections":16},{"courses_dept":"edst","courses_id":"577","numSections":16},{"courses_dept":"eece","courses_id":"597","numSections":16},{"courses_dept":"eosc","courses_id":"340","numSections":16},{"courses_dept":"epse","courses_id":"531","numSections":16},{"courses_dept":"epse","courses_id":"535","numSections":16},{"courses_dept":"epse","courses_id":"606","numSections":16},{"courses_dept":"geog","courses_id":"374","numSections":16},{"courses_dept":"germ","courses_id":"300","numSections":16},{"courses_dept":"germ","courses_id":"310","numSections":16},{"courses_dept":"hist","courses_id":"319","numSections":16},{"courses_dept":"ital","courses_id":"202","numSections":16},{"courses_dept":"law","courses_id":"325","numSections":16},{"courses_dept":"law","courses_id":"452","numSections":16},{"courses_dept":"law","courses_id":"463","numSections":16},{"courses_dept":"libe","courses_id":"463","numSections":16},{"courses_dept":"lled","courses_id":"222","numSections":16},{"courses_dept":"math","courses_id":"217","numSections":16},{"courses_dept":"math","courses_id":"400","numSections":16},{"courses_dept":"mine","courses_id":"393","numSections":16},{"courses_dept":"mine","courses_id":"553","numSections":16},{"courses_dept":"mine","courses_id":"597","numSections":16},{"courses_dept":"musc","courses_id":"300","numSections":16},{"courses_dept":"nest","courses_id":"101","numSections":16},{"courses_dept":"phys","courses_id":"159","numSections":16},{"courses_dept":"poli","courses_id":"303","numSections":16},{"courses_dept":"poli","courses_id":"373","numSections":16},{"courses_dept":"psyc","courses_id":"319","numSections":16},{"courses_dept":"psyc","courses_id":"367","numSections":16},{"courses_dept":"psyc","courses_id":"401","numSections":16},{"courses_dept":"psyc","courses_id":"549","numSections":16},{"courses_dept":"rhsc","courses_id":"509","numSections":16},{"courses_dept":"sowk","courses_id":"559","numSections":16},{"courses_dept":"visa","courses_id":"320","numSections":16},{"courses_dept":"visa","courses_id":"340","numSections":16},{"courses_dept":"apbi","courses_id":"418","numSections":17},{"courses_dept":"arth","courses_id":"599","numSections":17},{"courses_dept":"asia","courses_id":"354","numSections":17},{"courses_dept":"baac","courses_id":"510","numSections":17},{"courses_dept":"bafi","courses_id":"502","numSections":17},{"courses_dept":"bafi","courses_id":"520","numSections":17},{"courses_dept":"bahr","courses_id":"508","numSections":17},{"courses_dept":"busi","courses_id":"451","numSections":17},{"courses_dept":"chin","courses_id":"115","numSections":17},{"courses_dept":"chin","courses_id":"117","numSections":17},{"courses_dept":"chin","courses_id":"315","numSections":17},{"courses_dept":"chin","courses_id":"317","numSections":17},{"courses_dept":"clst","courses_id":"232","numSections":17},{"courses_dept":"cogs","courses_id":"402","numSections":17},{"courses_dept":"comm","courses_id":"454","numSections":17},{"courses_dept":"comm","courses_id":"459","numSections":17},{"courses_dept":"comm","courses_id":"474","numSections":17},{"courses_dept":"crwr","courses_id":"213","numSections":17},{"courses_dept":"econ","courses_id":"336","numSections":17},{"courses_dept":"econ","courses_id":"640","numSections":17},{"courses_dept":"etec","courses_id":"521","numSections":17},{"courses_dept":"germ","courses_id":"434","numSections":17},{"courses_dept":"hist","courses_id":"260","numSections":17},{"courses_dept":"japn","courses_id":"251","numSections":17},{"courses_dept":"libe","courses_id":"467","numSections":17},{"courses_dept":"libr","courses_id":"580","numSections":17},{"courses_dept":"ling","courses_id":"101","numSections":17},{"courses_dept":"lled","courses_id":"211","numSections":17},{"courses_dept":"math","courses_id":"335","numSections":17},{"courses_dept":"math","courses_id":"589","numSections":17},{"courses_dept":"musc","courses_id":"141","numSections":17},{"courses_dept":"nurs","courses_id":"505","numSections":17},{"courses_dept":"nurs","courses_id":"511","numSections":17},{"courses_dept":"pcth","courses_id":"549","numSections":17},{"courses_dept":"phil","courses_id":"100","numSections":17},{"courses_dept":"poli","courses_id":"380","numSections":17},{"courses_dept":"spph","courses_id":"527","numSections":17},{"courses_dept":"spph","courses_id":"545","numSections":17},{"courses_dept":"visa","courses_id":"330","numSections":17},{"courses_dept":"zool","courses_id":"549","numSections":17},{"courses_dept":"arch","courses_id":"561","numSections":18},{"courses_dept":"arth","courses_id":"340","numSections":18},{"courses_dept":"asia","courses_id":"356","numSections":18},{"courses_dept":"baac","courses_id":"550","numSections":18},{"courses_dept":"bama","courses_id":"550","numSections":18},{"courses_dept":"busi","courses_id":"221","numSections":18},{"courses_dept":"busi","courses_id":"445","numSections":18},{"courses_dept":"busi","courses_id":"446","numSections":18},{"courses_dept":"busi","courses_id":"460","numSections":18},{"courses_dept":"busi","courses_id":"470","numSections":18},{"courses_dept":"chem","courses_id":"154","numSections":18},{"courses_dept":"chem","courses_id":"211","numSections":18},{"courses_dept":"chil","courses_id":"599","numSections":18},{"courses_dept":"chin","courses_id":"311","numSections":18},{"courses_dept":"chin","courses_id":"313","numSections":18},{"courses_dept":"chin","courses_id":"321","numSections":18},{"courses_dept":"civl","courses_id":"210","numSections":18},{"courses_dept":"civl","courses_id":"215","numSections":18},{"courses_dept":"clst","courses_id":"231","numSections":18},{"courses_dept":"cnps","courses_id":"426","numSections":18},{"courses_dept":"comm","courses_id":"306","numSections":18},{"courses_dept":"comm","courses_id":"307","numSections":18},{"courses_dept":"comm","courses_id":"336","numSections":18},{"courses_dept":"comm","courses_id":"405","numSections":18},{"courses_dept":"comm","courses_id":"407","numSections":18},{"courses_dept":"comm","courses_id":"412","numSections":18},{"courses_dept":"comm","courses_id":"441","numSections":18},{"courses_dept":"comm","courses_id":"445","numSections":18},{"courses_dept":"comm","courses_id":"449","numSections":18},{"courses_dept":"comm","courses_id":"462","numSections":18},{"courses_dept":"comm","courses_id":"464","numSections":18},{"courses_dept":"comm","courses_id":"467","numSections":18},{"courses_dept":"cpsc","courses_id":"314","numSections":18},{"courses_dept":"cpsc","courses_id":"317","numSections":18},{"courses_dept":"cpsc","courses_id":"404","numSections":18},{"courses_dept":"econ","courses_id":"303","numSections":18},{"courses_dept":"econ","courses_id":"351","numSections":18},{"courses_dept":"edst","courses_id":"501","numSections":18},{"courses_dept":"engl","courses_id":"211","numSections":18},{"courses_dept":"engl","courses_id":"331","numSections":18},{"courses_dept":"envr","courses_id":"200","numSections":18},{"courses_dept":"eosc","courses_id":"112","numSections":18},{"courses_dept":"epse","courses_id":"505","numSections":18},{"courses_dept":"epse","courses_id":"595","numSections":18},{"courses_dept":"epse","courses_id":"596","numSections":18},{"courses_dept":"fnh","courses_id":"341","numSections":18},{"courses_dept":"fnh","courses_id":"350","numSections":18},{"courses_dept":"fren","courses_id":"215","numSections":18},{"courses_dept":"fren","courses_id":"355","numSections":18},{"courses_dept":"geob","courses_id":"270","numSections":18},{"courses_dept":"geob","courses_id":"372","numSections":18},{"courses_dept":"geog","courses_id":"121","numSections":18},{"courses_dept":"ital","courses_id":"201","numSections":18},{"courses_dept":"japn","courses_id":"250","numSections":18},{"courses_dept":"law","courses_id":"422","numSections":18},{"courses_dept":"law","courses_id":"489","numSections":18},{"courses_dept":"lfs","courses_id":"350","numSections":18},{"courses_dept":"libr","courses_id":"511","numSections":18},{"courses_dept":"ling","courses_id":"300","numSections":18},{"courses_dept":"ling","courses_id":"311","numSections":18},{"courses_dept":"mech","courses_id":"260","numSections":18},{"courses_dept":"mech","courses_id":"325","numSections":18},{"courses_dept":"mech","courses_id":"360","numSections":18},{"courses_dept":"mech","courses_id":"375","numSections":18},{"courses_dept":"mtrl","courses_id":"359","numSections":18},{"courses_dept":"musc","courses_id":"164","numSections":18},{"courses_dept":"musc","courses_id":"241","numSections":18},{"courses_dept":"phys","courses_id":"304","numSections":18},{"courses_dept":"phys","courses_id":"403","numSections":18},{"courses_dept":"rhsc","courses_id":"505","numSections":18},{"courses_dept":"soci","courses_id":"380","numSections":18},{"courses_dept":"spph","courses_id":"400","numSections":18},{"courses_dept":"spph","courses_id":"500","numSections":18},{"courses_dept":"spph","courses_id":"502","numSections":18},{"courses_dept":"spph","courses_id":"524","numSections":18},{"courses_dept":"spph","courses_id":"525","numSections":18},{"courses_dept":"spph","courses_id":"526","numSections":18},{"courses_dept":"spph","courses_id":"540","numSections":18},{"courses_dept":"stat","courses_id":"302","numSections":18},{"courses_dept":"visa","courses_id":"241","numSections":18},{"courses_dept":"baac","courses_id":"501","numSections":19},{"courses_dept":"bafi","courses_id":"530","numSections":19},{"courses_dept":"bahr","courses_id":"550","numSections":19},{"courses_dept":"chin","courses_id":"323","numSections":19},{"courses_dept":"dhyg","courses_id":"435","numSections":19},{"courses_dept":"econ","courses_id":"234","numSections":19},{"courses_dept":"edcp","courses_id":"491","numSections":19},{"courses_dept":"epse","courses_id":"526","numSections":19},{"courses_dept":"fipr","courses_id":"233","numSections":19},{"courses_dept":"law","courses_id":"468","numSections":19},{"courses_dept":"libe","courses_id":"465","numSections":19},{"courses_dept":"libr","courses_id":"535","numSections":19},{"courses_dept":"lled","courses_id":"223","numSections":19},{"courses_dept":"musc","courses_id":"311","numSections":19},{"courses_dept":"rhsc","courses_id":"503","numSections":19},{"courses_dept":"rhsc","courses_id":"507","numSections":19},{"courses_dept":"apbi","courses_id":"428","numSections":20},{"courses_dept":"arch","courses_id":"521","numSections":20},{"courses_dept":"arch","courses_id":"548","numSections":20},{"courses_dept":"bafi","courses_id":"507","numSections":20},{"courses_dept":"bahr","courses_id":"520","numSections":20},{"courses_dept":"bapa","courses_id":"550","numSections":20},{"courses_dept":"biol","courses_id":"343","numSections":20},{"courses_dept":"biol","courses_id":"364","numSections":20},{"courses_dept":"busi","courses_id":"444","numSections":20},{"courses_dept":"chem","courses_id":"245","numSections":20},{"courses_dept":"chem","courses_id":"335","numSections":20},{"courses_dept":"chin","courses_id":"104","numSections":20},{"courses_dept":"civl","courses_id":"200","numSections":20},{"courses_dept":"cnps","courses_id":"514","numSections":20},{"courses_dept":"comm","courses_id":"395","numSections":20},{"courses_dept":"comm","courses_id":"398","numSections":20},{"courses_dept":"comm","courses_id":"469","numSections":20},{"courses_dept":"comm","courses_id":"471","numSections":20},{"courses_dept":"crwr","courses_id":"200","numSections":20},{"courses_dept":"dent","courses_id":"599","numSections":20},{"courses_dept":"dhyg","courses_id":"401","numSections":20},{"courses_dept":"econ","courses_id":"456","numSections":20},{"courses_dept":"engl","courses_id":"111","numSections":20},{"courses_dept":"enph","courses_id":"352","numSections":20},{"courses_dept":"etec","courses_id":"520","numSections":20},{"courses_dept":"fre","courses_id":"302","numSections":20},{"courses_dept":"fren","courses_id":"353","numSections":20},{"courses_dept":"frst","courses_id":"544","numSections":20},{"courses_dept":"geog","courses_id":"290","numSections":20},{"courses_dept":"hist","courses_id":"106","numSections":20},{"courses_dept":"libr","courses_id":"505","numSections":20},{"courses_dept":"lled","courses_id":"213","numSections":20},{"courses_dept":"math","courses_id":"256","numSections":20},{"courses_dept":"spph","courses_id":"515","numSections":20},{"courses_dept":"visa","courses_id":"183","numSections":20},{"courses_dept":"visa","courses_id":"240","numSections":20},{"courses_dept":"bioc","courses_id":"421","numSections":21},{"courses_dept":"busi","courses_id":"493","numSections":21},{"courses_dept":"ceen","courses_id":"596","numSections":21},{"courses_dept":"chem","courses_id":"325","numSections":21},{"courses_dept":"chin","courses_id":"105","numSections":21},{"courses_dept":"chin","courses_id":"107","numSections":21},{"courses_dept":"eced","courses_id":"438","numSections":21},{"courses_dept":"epse","courses_id":"303","numSections":21},{"courses_dept":"epse","courses_id":"408","numSections":21},{"courses_dept":"etec","courses_id":"540","numSections":21},{"courses_dept":"fre","courses_id":"490","numSections":21},{"courses_dept":"frst","courses_id":"319","numSections":21},{"courses_dept":"geog","courses_id":"352","numSections":21},{"courses_dept":"japn","courses_id":"150","numSections":21},{"courses_dept":"japn","courses_id":"151","numSections":21},{"courses_dept":"kin","courses_id":"103","numSections":21},{"courses_dept":"kin","courses_id":"191","numSections":21},{"courses_dept":"kin","courses_id":"330","numSections":21},{"courses_dept":"larc","courses_id":"504","numSections":21},{"courses_dept":"mine","courses_id":"598","numSections":21},{"courses_dept":"path","courses_id":"549","numSections":21},{"courses_dept":"psyc","courses_id":"207","numSections":21},{"courses_dept":"sowk","courses_id":"310","numSections":21},{"courses_dept":"sowk","courses_id":"316","numSections":21},{"courses_dept":"sowk","courses_id":"425","numSections":21},{"courses_dept":"visa","courses_id":"210","numSections":21},{"courses_dept":"visa","courses_id":"260","numSections":21},{"courses_dept":"bahr","courses_id":"505","numSections":22},{"courses_dept":"basm","courses_id":"530","numSections":22},{"courses_dept":"basm","courses_id":"531","numSections":22},{"courses_dept":"biol","courses_id":"230","numSections":22},{"courses_dept":"biol","courses_id":"306","numSections":22},{"courses_dept":"biol","courses_id":"336","numSections":22},{"courses_dept":"chin","courses_id":"108","numSections":22},{"courses_dept":"chin","courses_id":"113","numSections":22},{"courses_dept":"comm","courses_id":"202","numSections":22},{"courses_dept":"cpsc","courses_id":"322","numSections":22},{"courses_dept":"econ","courses_id":"365","numSections":22},{"courses_dept":"econ","courses_id":"370","numSections":22},{"courses_dept":"econ","courses_id":"471","numSections":22},{"courses_dept":"fnh","courses_id":"490","numSections":22},{"courses_dept":"fren","courses_id":"222","numSections":22},{"courses_dept":"fren","courses_id":"342","numSections":22},{"courses_dept":"fren","courses_id":"348","numSections":22},{"courses_dept":"fren","courses_id":"349","numSections":22},{"courses_dept":"hist","courses_id":"549","numSections":22},{"courses_dept":"libr","courses_id":"554","numSections":22},{"courses_dept":"ling","courses_id":"200","numSections":22},{"courses_dept":"ling","courses_id":"201","numSections":22},{"courses_dept":"lled","courses_id":"212","numSections":22},{"courses_dept":"lled","courses_id":"469","numSections":22},{"courses_dept":"lled","courses_id":"479","numSections":22},{"courses_dept":"nurs","courses_id":"504","numSections":22},{"courses_dept":"psyc","courses_id":"331","numSections":22},{"courses_dept":"comm","courses_id":"457","numSections":23},{"courses_dept":"cpsc","courses_id":"320","numSections":23},{"courses_dept":"dhyg","courses_id":"405","numSections":23},{"courses_dept":"edst","courses_id":"581","numSections":23},{"courses_dept":"fnh","courses_id":"355","numSections":23},{"courses_dept":"fre","courses_id":"295","numSections":23},{"courses_dept":"geob","courses_id":"102","numSections":23},{"courses_dept":"germ","courses_id":"301","numSections":23},{"courses_dept":"kin","courses_id":"190","numSections":23},{"courses_dept":"libe","courses_id":"461","numSections":23},{"courses_dept":"libr","courses_id":"594","numSections":23},{"courses_dept":"ling","courses_id":"100","numSections":23},{"courses_dept":"punj","courses_id":"102","numSections":23},{"courses_dept":"rhsc","courses_id":"501","numSections":23},{"courses_dept":"sowk","courses_id":"416","numSections":23},{"courses_dept":"span","courses_id":"207","numSections":23},{"courses_dept":"arth","courses_id":"227","numSections":24},{"courses_dept":"bama","courses_id":"508","numSections":24},{"courses_dept":"biol","courses_id":"153","numSections":24},{"courses_dept":"biol","courses_id":"155","numSections":24},{"courses_dept":"biol","courses_id":"204","numSections":24},{"courses_dept":"chbe","courses_id":"599","numSections":24},{"courses_dept":"chem","courses_id":"345","numSections":24},{"courses_dept":"chin","courses_id":"111","numSections":24},{"courses_dept":"comm","courses_id":"475","numSections":24},{"courses_dept":"dhyg","courses_id":"461","numSections":24},{"courses_dept":"edcp","courses_id":"508","numSections":24},{"courses_dept":"edst","courses_id":"582","numSections":24},{"courses_dept":"epse","courses_id":"348","numSections":24},{"courses_dept":"epse","courses_id":"436","numSections":24},{"courses_dept":"epse","courses_id":"437","numSections":24},{"courses_dept":"epse","courses_id":"592","numSections":24},{"courses_dept":"etec","courses_id":"522","numSections":24},{"courses_dept":"hist","courses_id":"441","numSections":24},{"courses_dept":"japn","courses_id":"212","numSections":24},{"courses_dept":"japn","courses_id":"213","numSections":24},{"courses_dept":"japn","courses_id":"303","numSections":24},{"courses_dept":"math","courses_id":"312","numSections":24},{"courses_dept":"medg","courses_id":"570","numSections":24},{"courses_dept":"micb","courses_id":"201","numSections":24},{"courses_dept":"nurs","courses_id":"502","numSections":24},{"courses_dept":"poli","courses_id":"220","numSections":24},{"courses_dept":"poli","courses_id":"366","numSections":24},{"courses_dept":"psyc","courses_id":"208","numSections":24},{"courses_dept":"rhsc","courses_id":"420","numSections":24},{"courses_dept":"span","courses_id":"302","numSections":24},{"courses_dept":"visa","courses_id":"180","numSections":24},{"courses_dept":"arch","courses_id":"549","numSections":25},{"courses_dept":"edst","courses_id":"532","numSections":25},{"courses_dept":"engl","courses_id":"225","numSections":25},{"courses_dept":"epse","courses_id":"312","numSections":25},{"courses_dept":"fist","courses_id":"332","numSections":25},{"courses_dept":"geob","courses_id":"103","numSections":25},{"courses_dept":"law","courses_id":"549","numSections":25},{"courses_dept":"math","courses_id":"300","numSections":25},{"courses_dept":"mech","courses_id":"698","numSections":25},{"courses_dept":"nurs","courses_id":"595","numSections":25},{"courses_dept":"soci","courses_id":"342","numSections":25},{"courses_dept":"visa","courses_id":"110","numSections":25},{"courses_dept":"visa","courses_id":"250","numSections":25},{"courses_dept":"bama","courses_id":"514","numSections":26},{"courses_dept":"basm","courses_id":"502","numSections":26},{"courses_dept":"biol","courses_id":"234","numSections":26},{"courses_dept":"biol","courses_id":"363","numSections":26},{"courses_dept":"chin","courses_id":"481","numSections":26},{"courses_dept":"chin","courses_id":"483","numSections":26},{"courses_dept":"cnps","courses_id":"545","numSections":26},{"courses_dept":"cnps","courses_id":"574","numSections":26},{"courses_dept":"cnps","courses_id":"584","numSections":26},{"courses_dept":"cpsc","courses_id":"310","numSections":26},{"courses_dept":"cpsc","courses_id":"313","numSections":26},{"courses_dept":"epse","courses_id":"528","numSections":26},{"courses_dept":"etec","courses_id":"532","numSections":26},{"courses_dept":"japn","courses_id":"301","numSections":26},{"courses_dept":"japn","courses_id":"302","numSections":26},{"courses_dept":"korn","courses_id":"102","numSections":26},{"courses_dept":"math","courses_id":"110","numSections":26},{"courses_dept":"nurs","courses_id":"599","numSections":26},{"courses_dept":"visa","courses_id":"230","numSections":26},{"courses_dept":"asia","courses_id":"355","numSections":27},{"courses_dept":"basc","courses_id":"500","numSections":27},{"courses_dept":"chin","courses_id":"431","numSections":27},{"courses_dept":"chin","courses_id":"433","numSections":27},{"courses_dept":"cnps","courses_id":"586","numSections":27},{"courses_dept":"comm","courses_id":"473","numSections":27},{"courses_dept":"etec","courses_id":"531","numSections":27},{"courses_dept":"fmst","courses_id":"312","numSections":27},{"courses_dept":"geog","courses_id":"122","numSections":27},{"courses_dept":"japn","courses_id":"300","numSections":27},{"courses_dept":"kin","courses_id":"361","numSections":27},{"courses_dept":"kin","courses_id":"375","numSections":27},{"courses_dept":"lfs","courses_id":"250","numSections":27},{"courses_dept":"medi","courses_id":"549","numSections":27},{"courses_dept":"nurs","courses_id":"337","numSections":27},{"courses_dept":"phys","courses_id":"100","numSections":27},{"courses_dept":"psyc","courses_id":"333","numSections":27},{"courses_dept":"arch","courses_id":"501","numSections":28},{"courses_dept":"busi","courses_id":"329","numSections":28},{"courses_dept":"clst","courses_id":"105","numSections":28},{"courses_dept":"eced","courses_id":"416","numSections":28},{"courses_dept":"econ","courses_id":"371","numSections":28},{"courses_dept":"eosc","courses_id":"110","numSections":28},{"courses_dept":"epse","courses_id":"406","numSections":28},{"courses_dept":"etec","courses_id":"530","numSections":28},{"courses_dept":"libr","courses_id":"504","numSections":28},{"courses_dept":"mech","courses_id":"598","numSections":28},{"courses_dept":"mtrl","courses_id":"599","numSections":28},{"courses_dept":"soci","courses_id":"328","numSections":28},{"courses_dept":"span","courses_id":"206","numSections":28},{"courses_dept":"adhe","courses_id":"412","numSections":29},{"courses_dept":"comm","courses_id":"377","numSections":29},{"courses_dept":"eosc","courses_id":"326","numSections":29},{"courses_dept":"epse","courses_id":"316","numSections":29},{"courses_dept":"epse","courses_id":"482","numSections":29},{"courses_dept":"fist","courses_id":"100","numSections":29},{"courses_dept":"geog","courses_id":"310","numSections":29},{"courses_dept":"geog","courses_id":"599","numSections":29},{"courses_dept":"hist","courses_id":"103","numSections":29},{"courses_dept":"japn","courses_id":"211","numSections":29},{"courses_dept":"kin","courses_id":"275","numSections":29},{"courses_dept":"sowk","courses_id":"570","numSections":29},{"courses_dept":"visa","courses_id":"220","numSections":29},{"courses_dept":"biol","courses_id":"111","numSections":30},{"courses_dept":"biol","courses_id":"300","numSections":30},{"courses_dept":"biol","courses_id":"335","numSections":30},{"courses_dept":"biol","courses_id":"361","numSections":30},{"courses_dept":"busi","courses_id":"100","numSections":30},{"courses_dept":"busi","courses_id":"101","numSections":30},{"courses_dept":"busi","courses_id":"111","numSections":30},{"courses_dept":"busi","courses_id":"112","numSections":30},{"courses_dept":"busi","courses_id":"121","numSections":30},{"courses_dept":"busi","courses_id":"300","numSections":30},{"courses_dept":"busi","courses_id":"330","numSections":30},{"courses_dept":"busi","courses_id":"331","numSections":30},{"courses_dept":"busi","courses_id":"344","numSections":30},{"courses_dept":"busi","courses_id":"400","numSections":30},{"courses_dept":"busi","courses_id":"401","numSections":30},{"courses_dept":"busi","courses_id":"442","numSections":30},{"courses_dept":"busi","courses_id":"443","numSections":30},{"courses_dept":"busi","courses_id":"452","numSections":30},{"courses_dept":"busi","courses_id":"499","numSections":30},{"courses_dept":"cnps","courses_id":"433","numSections":30},{"courses_dept":"comm","courses_id":"465","numSections":30},{"courses_dept":"cpsc","courses_id":"304","numSections":30},{"courses_dept":"epse","courses_id":"421","numSections":30},{"courses_dept":"fnh","courses_id":"330","numSections":30},{"courses_dept":"hist","courses_id":"432","numSections":30},{"courses_dept":"lled","courses_id":"441","numSections":30},{"courses_dept":"math","courses_id":"302","numSections":30},{"courses_dept":"nrsc","courses_id":"549","numSections":30},{"courses_dept":"phys","courses_id":"170","numSections":30},{"courses_dept":"poli","courses_id":"240","numSections":30},{"courses_dept":"scie","courses_id":"300","numSections":30},{"courses_dept":"span","courses_id":"301","numSections":30},{"courses_dept":"baac","courses_id":"500","numSections":31},{"courses_dept":"comm","courses_id":"453","numSections":31},{"courses_dept":"cpsc","courses_id":"213","numSections":31},{"courses_dept":"dhyg","courses_id":"462","numSections":31},{"courses_dept":"epse","courses_id":"432","numSections":31},{"courses_dept":"epse","courses_id":"449","numSections":31},{"courses_dept":"epse","courses_id":"512","numSections":31},{"courses_dept":"fren","courses_id":"221","numSections":31},{"courses_dept":"phil","courses_id":"125","numSections":31},{"courses_dept":"stat","courses_id":"241","numSections":31},{"courses_dept":"bafi","courses_id":"511","numSections":32},{"courses_dept":"cnps","courses_id":"564","numSections":32},{"courses_dept":"comm","courses_id":"101","numSections":32},{"courses_dept":"comm","courses_id":"493","numSections":32},{"courses_dept":"comm","courses_id":"497","numSections":32},{"courses_dept":"eece","courses_id":"599","numSections":32},{"courses_dept":"engl","courses_id":"227","numSections":32},{"courses_dept":"epse","courses_id":"403","numSections":32},{"courses_dept":"phys","courses_id":"109","numSections":32},{"courses_dept":"soci","courses_id":"382","numSections":32},{"courses_dept":"bioc","courses_id":"302","numSections":33},{"courses_dept":"cens","courses_id":"202","numSections":33},{"courses_dept":"comm","courses_id":"365","numSections":33},{"courses_dept":"comm","courses_id":"468","numSections":33},{"courses_dept":"engl","courses_id":"224","numSections":33},{"courses_dept":"engl","courses_id":"358","numSections":33},{"courses_dept":"etec","courses_id":"512","numSections":33},{"courses_dept":"hist","courses_id":"102","numSections":33},{"courses_dept":"hist","courses_id":"104","numSections":33},{"courses_dept":"apbi","courses_id":"200","numSections":34},{"courses_dept":"bafi","courses_id":"500","numSections":34},{"courses_dept":"engl","courses_id":"362","numSections":34},{"courses_dept":"eosc","courses_id":"310","numSections":34},{"courses_dept":"eosc","courses_id":"315","numSections":34},{"courses_dept":"biol","courses_id":"201","numSections":35},{"courses_dept":"comm","courses_id":"329","numSections":35},{"courses_dept":"engl","courses_id":"223","numSections":35},{"courses_dept":"fren","courses_id":"220","numSections":35},{"courses_dept":"japn","courses_id":"210","numSections":35},{"courses_dept":"phar","courses_id":"303","numSections":35},{"courses_dept":"phar","courses_id":"401","numSections":35},{"courses_dept":"phil","courses_id":"101","numSections":35},{"courses_dept":"psyc","courses_id":"320","numSections":35},{"courses_dept":"stat","courses_id":"251","numSections":35},{"courses_dept":"basm","courses_id":"501","numSections":36},{"courses_dept":"busi","courses_id":"335","numSections":36},{"courses_dept":"chem","courses_id":"205","numSections":36},{"courses_dept":"cnps","courses_id":"364","numSections":36},{"courses_dept":"cnps","courses_id":"427","numSections":36},{"courses_dept":"comm","courses_id":"335","numSections":36},{"courses_dept":"edcp","courses_id":"562","numSections":36},{"courses_dept":"eosc","courses_id":"116","numSections":36},{"courses_dept":"etec","courses_id":"510","numSections":36},{"courses_dept":"etec","courses_id":"511","numSections":36},{"courses_dept":"fmst","courses_id":"314","numSections":36},{"courses_dept":"frst","courses_id":"231","numSections":36},{"courses_dept":"germ","courses_id":"210","numSections":36},{"courses_dept":"law","courses_id":"430","numSections":36},{"courses_dept":"math","courses_id":"307","numSections":36},{"courses_dept":"math","courses_id":"317","numSections":36},{"courses_dept":"math","courses_id":"340","numSections":36},{"courses_dept":"micb","courses_id":"202","numSections":36},{"courses_dept":"phys","courses_id":"102","numSections":36},{"courses_dept":"adhe","courses_id":"327","numSections":37},{"courses_dept":"adhe","courses_id":"329","numSections":37},{"courses_dept":"apsc","courses_id":"160","numSections":37},{"courses_dept":"arch","courses_id":"540","numSections":37},{"courses_dept":"comm","courses_id":"290","numSections":37},{"courses_dept":"comm","courses_id":"291","numSections":37},{"courses_dept":"comm","courses_id":"355","numSections":37},{"courses_dept":"cpsc","courses_id":"221","numSections":37},{"courses_dept":"eosc","courses_id":"314","numSections":37},{"courses_dept":"audi","courses_id":"402","numSections":38},{"courses_dept":"bahr","courses_id":"507","numSections":38},{"courses_dept":"comm","courses_id":"363","numSections":38},{"courses_dept":"geog","courses_id":"350","numSections":38},{"courses_dept":"phil","courses_id":"102","numSections":38},{"courses_dept":"adhe","courses_id":"330","numSections":39},{"courses_dept":"clst","courses_id":"301","numSections":39},{"courses_dept":"cpsc","courses_id":"210","numSections":39},{"courses_dept":"eosc","courses_id":"118","numSections":39},{"courses_dept":"germ","courses_id":"200","numSections":39},{"courses_dept":"musc","courses_id":"103","numSections":39},{"courses_dept":"chin","courses_id":"103","numSections":40},{"courses_dept":"comm","courses_id":"353","numSections":40},{"courses_dept":"comm","courses_id":"354","numSections":40},{"courses_dept":"comm","courses_id":"374","numSections":40},{"courses_dept":"crwr","courses_id":"599","numSections":40},{"courses_dept":"econ","courses_id":"221","numSections":40},{"courses_dept":"econ","courses_id":"301","numSections":40},{"courses_dept":"econ","courses_id":"325","numSections":40},{"courses_dept":"econ","courses_id":"356","numSections":40},{"courses_dept":"etec","courses_id":"500","numSections":40},{"courses_dept":"nurs","courses_id":"333","numSections":40},{"courses_dept":"nurs","courses_id":"334","numSections":40},{"courses_dept":"nurs","courses_id":"335","numSections":40},{"courses_dept":"nurs","courses_id":"336","numSections":40},{"courses_dept":"arch","courses_id":"520","numSections":41},{"courses_dept":"busi","courses_id":"393","numSections":41},{"courses_dept":"comm","courses_id":"362","numSections":41},{"courses_dept":"econ","courses_id":"345","numSections":41},{"courses_dept":"math","courses_id":"180","numSections":41},{"courses_dept":"math","courses_id":"220","numSections":41},{"courses_dept":"poli","courses_id":"100","numSections":41},{"courses_dept":"poli","courses_id":"101","numSections":41},{"courses_dept":"busi","courses_id":"370","numSections":42},{"courses_dept":"econ","courses_id":"326","numSections":42},{"courses_dept":"econ","courses_id":"355","numSections":42},{"courses_dept":"engl","courses_id":"301","numSections":42},{"courses_dept":"math","courses_id":"152","numSections":42},{"courses_dept":"math","courses_id":"257","numSections":42},{"courses_dept":"math","courses_id":"316","numSections":42},{"courses_dept":"psyc","courses_id":"302","numSections":42},{"courses_dept":"comm","courses_id":"371","numSections":43},{"courses_dept":"cpsc","courses_id":"121","numSections":43},{"courses_dept":"econ","courses_id":"302","numSections":43},{"courses_dept":"math","courses_id":"102","numSections":43},{"courses_dept":"math","courses_id":"103","numSections":43},{"courses_dept":"poli","courses_id":"260","numSections":43},{"courses_dept":"soci","courses_id":"200","numSections":43},{"courses_dept":"stat","courses_id":"200","numSections":43},{"courses_dept":"biol","courses_id":"200","numSections":44},{"courses_dept":"fmst","courses_id":"316","numSections":45},{"courses_dept":"busi","courses_id":"294","numSections":46},{"courses_dept":"comm","courses_id":"293","numSections":46},{"courses_dept":"comm","courses_id":"455","numSections":46},{"courses_dept":"comm","courses_id":"295","numSections":47},{"courses_dept":"germ","courses_id":"433","numSections":47},{"courses_dept":"busi","courses_id":"355","numSections":48},{"courses_dept":"chem","courses_id":"233","numSections":48},{"courses_dept":"engl","courses_id":"321","numSections":48},{"courses_dept":"psyc","courses_id":"304","numSections":48},{"courses_dept":"busi","courses_id":"293","numSections":49},{"courses_dept":"cpsc","courses_id":"110","numSections":49},{"courses_dept":"ital","courses_id":"102","numSections":49},{"courses_dept":"psyc","courses_id":"307","numSections":50},{"courses_dept":"chin","courses_id":"101","numSections":51},{"courses_dept":"cnps","courses_id":"365","numSections":51},{"courses_dept":"math","courses_id":"255","numSections":51},{"courses_dept":"busi","courses_id":"453","numSections":52},{"courses_dept":"busi","courses_id":"455","numSections":52},{"courses_dept":"cnps","courses_id":"363","numSections":52},{"courses_dept":"comm","courses_id":"450","numSections":53},{"courses_dept":"japn","courses_id":"103","numSections":53},{"courses_dept":"biol","courses_id":"112","numSections":54},{"courses_dept":"busi","courses_id":"353","numSections":54},{"courses_dept":"busi","courses_id":"354","numSections":54},{"courses_dept":"comm","courses_id":"298","numSections":54},{"courses_dept":"fren","courses_id":"123","numSections":54},{"courses_dept":"comm","courses_id":"294","numSections":55},{"courses_dept":"engl","courses_id":"221","numSections":55},{"courses_dept":"japn","courses_id":"102","numSections":55},{"courses_dept":"math","courses_id":"184","numSections":55},{"courses_dept":"math","courses_id":"221","numSections":55},{"courses_dept":"fnh","courses_id":"250","numSections":56},{"courses_dept":"math","courses_id":"104","numSections":56},{"courses_dept":"math","courses_id":"253","numSections":56},{"courses_dept":"psyc","courses_id":"101","numSections":56},{"courses_dept":"chem","courses_id":"315","numSections":57},{"courses_dept":"comm","courses_id":"498","numSections":58},{"courses_dept":"math","courses_id":"215","numSections":58},{"courses_dept":"phys","courses_id":"101","numSections":58},{"courses_dept":"psyc","courses_id":"218","numSections":58},{"courses_dept":"fmst","courses_id":"210","numSections":59},{"courses_dept":"math","courses_id":"100","numSections":59},{"courses_dept":"phil","courses_id":"120","numSections":59},{"courses_dept":"psyc","courses_id":"217","numSections":59},{"courses_dept":"psyc","courses_id":"315","numSections":59},{"courses_dept":"busi","courses_id":"450","numSections":60},{"courses_dept":"psyc","courses_id":"102","numSections":60},{"courses_dept":"chem","courses_id":"123","numSections":62},{"courses_dept":"lled","courses_id":"200","numSections":63},{"courses_dept":"psyc","courses_id":"314","numSections":64},{"courses_dept":"eosc","courses_id":"114","numSections":65},{"courses_dept":"germ","courses_id":"110","numSections":65},{"courses_dept":"span","courses_id":"202","numSections":65},{"courses_dept":"eosc","courses_id":"111","numSections":66},{"courses_dept":"engl","courses_id":"100","numSections":68},{"courses_dept":"span","courses_id":"201","numSections":69},{"courses_dept":"engl","courses_id":"222","numSections":70},{"courses_dept":"comm","courses_id":"370","numSections":71},{"courses_dept":"wrds","courses_id":"150","numSections":71},{"courses_dept":"biol","courses_id":"121","numSections":72},{"courses_dept":"fnh","courses_id":"200","numSections":73},{"courses_dept":"chem","courses_id":"121","numSections":74},{"courses_dept":"engl","courses_id":"220","numSections":74},{"courses_dept":"engl","courses_id":"490","numSections":74},{"courses_dept":"ital","courses_id":"101","numSections":74},{"courses_dept":"math","courses_id":"200","numSections":75},{"courses_dept":"comm","courses_id":"393","numSections":76},{"courses_dept":"fren","courses_id":"102","numSections":77},{"courses_dept":"fren","courses_id":"122","numSections":79},{"courses_dept":"comm","courses_id":"491","numSections":80},{"courses_dept":"comm","courses_id":"296","numSections":82},{"courses_dept":"math","courses_id":"105","numSections":82},{"courses_dept":"scie","courses_id":"113","numSections":82},{"courses_dept":"japn","courses_id":"101","numSections":83},{"courses_dept":"biol","courses_id":"140","numSections":84},{"courses_dept":"educ","courses_id":"500","numSections":84},{"courses_dept":"econ","courses_id":"102","numSections":86},{"courses_dept":"econ","courses_id":"490","numSections":86},{"courses_dept":"math","courses_id":"101","numSections":86},{"courses_dept":"fren","courses_id":"112","numSections":88},{"courses_dept":"econ","courses_id":"101","numSections":93},{"courses_dept":"apsc","courses_id":"279","numSections":94},{"courses_dept":"span","courses_id":"102","numSections":94},{"courses_dept":"cnps","courses_id":"362","numSections":98},{"courses_dept":"fren","courses_id":"101","numSections":103},{"courses_dept":"chem","courses_id":"235","numSections":104},{"courses_dept":"comm","courses_id":"292","numSections":111},{"courses_dept":"fren","courses_id":"111","numSections":111},{"courses_dept":"comm","courses_id":"394","numSections":114},{"courses_dept":"japn","courses_id":"100","numSections":117},{"courses_dept":"span","courses_id":"101","numSections":124},{"courses_dept":"germ","courses_id":"100","numSections":126},{"courses_dept":"engl","courses_id":"110","numSections":145},{"courses_dept":"apsc","courses_id":"201","numSections":151},{"courses_dept":"comm","courses_id":"390","numSections":174},{"courses_dept":"engl","courses_id":"112","numSections":571}]};
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });

    it("Should be able to query with UP ORDER", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult: any =
        { render: 'TABLE',
            result:
                [ { courses_id: '261', courseAverage: 68.41 },
                    { courses_id: '320', courseAverage: 70.61 },
                    { courses_id: '415', courseAverage: 70.72 },
                    { courses_id: '420', courseAverage: 71.57 },
                    { courses_id: '317', courseAverage: 72.09 },
                    { courses_id: '322', courseAverage: 73.47 },
                    { courses_id: '404', courseAverage: 73.47 },
                    { courses_id: '303', courseAverage: 73.55 },
                    { courses_id: '340', courseAverage: 73.55 },
                    { courses_id: '210', courseAverage: 74.08 },
                    { courses_id: '313', courseAverage: 74.15 },
                    { courses_id: '422', courseAverage: 74.15 },
                    { courses_id: '425', courseAverage: 74.16 },
                    { courses_id: '213', courseAverage: 74.37 },
                    { courses_id: '110', courseAverage: 74.61 },
                    { courses_id: '416', courseAverage: 74.8 },
                    { courses_id: '259', courseAverage: 74.98 },
                    { courses_id: '221', courseAverage: 75.08 },
                    { courses_id: '302', courseAverage: 76.2 },
                    { courses_id: '121', courseAverage: 76.24 },
                    { courses_id: '314', courseAverage: 76.71 },
                    { courses_id: '421', courseAverage: 76.83 },
                    { courses_id: '304', courseAverage: 76.86 },
                    { courses_id: '311', courseAverage: 77.17 },
                    { courses_id: '410', courseAverage: 77.61 },
                    { courses_id: '418', courseAverage: 77.74 },
                    { courses_id: '430', courseAverage: 77.77 },
                    { courses_id: '310', courseAverage: 78.06 },
                    { courses_id: '344', courseAverage: 79.05 },
                    { courses_id: '444', courseAverage: 79.19 },
                    { courses_id: '411', courseAverage: 79.34 },
                    { courses_id: '515', courseAverage: 81.02 },
                    { courses_id: '513', courseAverage: 81.5 },
                    { courses_id: '445', courseAverage: 81.61 },
                    { courses_id: '301', courseAverage: 81.64 },
                    { courses_id: '312', courseAverage: 81.81 },
                    { courses_id: '502', courseAverage: 83.22 },
                    { courses_id: '527', courseAverage: 83.78 },
                    { courses_id: '500', courseAverage: 83.95 },
                    { courses_id: '319', courseAverage: 84.15 },
                    { courses_id: '544', courseAverage: 84.25 },
                    { courses_id: '521', courseAverage: 84.86 },
                    { courses_id: '509', courseAverage: 85.72 },
                    { courses_id: '522', courseAverage: 85.75 },
                    { courses_id: '589', courseAverage: 85.82 },
                    { courses_id: '540', courseAverage: 86.46 },
                    { courses_id: '543', courseAverage: 87.32 },
                    { courses_id: '503', courseAverage: 88.43 },
                    { courses_id: '547', courseAverage: 88.47 },
                    { courses_id: '507', courseAverage: 88.57 },
                    { courses_id: '501', courseAverage: 90.21 },
                    { courses_id: '490', courseAverage: 90.73 },
                    { courses_id: '449', courseAverage: 92.1 } ] };
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });

    it("Should be able to query with DOWN ORDER", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult: any =
        { render: 'TABLE',
            result:
                [ { courses_id: '449', courseAverage: 92.1 },
                    { courses_id: '490', courseAverage: 90.73 },
                    { courses_id: '501', courseAverage: 90.21 },
                    { courses_id: '507', courseAverage: 88.57 },
                    { courses_id: '547', courseAverage: 88.47 },
                    { courses_id: '503', courseAverage: 88.43 },
                    { courses_id: '543', courseAverage: 87.32 },
                    { courses_id: '540', courseAverage: 86.46 },
                    { courses_id: '589', courseAverage: 85.82 },
                    { courses_id: '522', courseAverage: 85.75 },
                    { courses_id: '509', courseAverage: 85.72 },
                    { courses_id: '521', courseAverage: 84.86 },
                    { courses_id: '544', courseAverage: 84.25 },
                    { courses_id: '319', courseAverage: 84.15 },
                    { courses_id: '500', courseAverage: 83.95 },
                    { courses_id: '527', courseAverage: 83.78 },
                    { courses_id: '502', courseAverage: 83.22 },
                    { courses_id: '312', courseAverage: 81.81 },
                    { courses_id: '301', courseAverage: 81.64 },
                    { courses_id: '445', courseAverage: 81.61 },
                    { courses_id: '513', courseAverage: 81.5 },
                    { courses_id: '515', courseAverage: 81.02 },
                    { courses_id: '411', courseAverage: 79.34 },
                    { courses_id: '444', courseAverage: 79.19 },
                    { courses_id: '344', courseAverage: 79.05 },
                    { courses_id: '310', courseAverage: 78.06 },
                    { courses_id: '430', courseAverage: 77.77 },
                    { courses_id: '418', courseAverage: 77.74 },
                    { courses_id: '410', courseAverage: 77.61 },
                    { courses_id: '311', courseAverage: 77.17 },
                    { courses_id: '304', courseAverage: 76.86 },
                    { courses_id: '421', courseAverage: 76.83 },
                    { courses_id: '314', courseAverage: 76.71 },
                    { courses_id: '121', courseAverage: 76.24 },
                    { courses_id: '302', courseAverage: 76.2 },
                    { courses_id: '221', courseAverage: 75.08 },
                    { courses_id: '259', courseAverage: 74.98 },
                    { courses_id: '416', courseAverage: 74.8 },
                    { courses_id: '110', courseAverage: 74.61 },
                    { courses_id: '213', courseAverage: 74.37 },
                    { courses_id: '425', courseAverage: 74.16 },
                    { courses_id: '422', courseAverage: 74.15 },
                    { courses_id: '313', courseAverage: 74.15 },
                    { courses_id: '210', courseAverage: 74.08 },
                    { courses_id: '340', courseAverage: 73.55 },
                    { courses_id: '303', courseAverage: 73.55 },
                    { courses_id: '404', courseAverage: 73.47 },
                    { courses_id: '322', courseAverage: 73.47 },
                    { courses_id: '317', courseAverage: 72.09 },
                    { courses_id: '420', courseAverage: 71.57 },
                    { courses_id: '415', courseAverage: 70.72 },
                    { courses_id: '320', courseAverage: 70.61 },
                    { courses_id: '261', courseAverage: 68.41 } ] };
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });

    it("Should be able to query with DOWN ORDER", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult: any =
        { render: 'TABLE',
            result:
                [ { courses_id: '449', courseAverage: 92.1 },
                    { courses_id: '490', courseAverage: 90.73 },
                    { courses_id: '501', courseAverage: 90.21 },
                    { courses_id: '507', courseAverage: 88.57 },
                    { courses_id: '547', courseAverage: 88.47 },
                    { courses_id: '503', courseAverage: 88.43 },
                    { courses_id: '543', courseAverage: 87.32 },
                    { courses_id: '540', courseAverage: 86.46 },
                    { courses_id: '589', courseAverage: 85.82 },
                    { courses_id: '522', courseAverage: 85.75 },
                    { courses_id: '509', courseAverage: 85.72 },
                    { courses_id: '521', courseAverage: 84.86 },
                    { courses_id: '544', courseAverage: 84.25 },
                    { courses_id: '319', courseAverage: 84.15 },
                    { courses_id: '500', courseAverage: 83.95 },
                    { courses_id: '527', courseAverage: 83.78 },
                    { courses_id: '502', courseAverage: 83.22 },
                    { courses_id: '312', courseAverage: 81.81 },
                    { courses_id: '301', courseAverage: 81.64 },
                    { courses_id: '445', courseAverage: 81.61 },
                    { courses_id: '513', courseAverage: 81.5 },
                    { courses_id: '515', courseAverage: 81.02 },
                    { courses_id: '411', courseAverage: 79.34 },
                    { courses_id: '444', courseAverage: 79.19 },
                    { courses_id: '344', courseAverage: 79.05 },
                    { courses_id: '310', courseAverage: 78.06 },
                    { courses_id: '430', courseAverage: 77.77 },
                    { courses_id: '418', courseAverage: 77.74 },
                    { courses_id: '410', courseAverage: 77.61 },
                    { courses_id: '311', courseAverage: 77.17 },
                    { courses_id: '304', courseAverage: 76.86 },
                    { courses_id: '421', courseAverage: 76.83 },
                    { courses_id: '314', courseAverage: 76.71 },
                    { courses_id: '121', courseAverage: 76.24 },
                    { courses_id: '302', courseAverage: 76.2 },
                    { courses_id: '221', courseAverage: 75.08 },
                    { courses_id: '259', courseAverage: 74.98 },
                    { courses_id: '416', courseAverage: 74.8 },
                    { courses_id: '110', courseAverage: 74.61 },
                    { courses_id: '213', courseAverage: 74.37 },
                    { courses_id: '425', courseAverage: 74.16 },
                    { courses_id: '422', courseAverage: 74.15 },
                    { courses_id: '313', courseAverage: 74.15 },
                    { courses_id: '210', courseAverage: 74.08 },
                    { courses_id: '340', courseAverage: 73.55 },
                    { courses_id: '303', courseAverage: 73.55 },
                    { courses_id: '404', courseAverage: 73.47 },
                    { courses_id: '322', courseAverage: 73.47 },
                    { courses_id: '317', courseAverage: 72.09 },
                    { courses_id: '420', courseAverage: 71.57 },
                    { courses_id: '415', courseAverage: 70.72 },
                    { courses_id: '320', courseAverage: 70.61 },
                    { courses_id: '261', courseAverage: 68.41 } ] };
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });


    it("Should be able to query - MAX", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
            "GROUP": [ "courses_id" ],
            "APPLY": [ {"courseAverage": {"MAX": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courses_id", "courseAverage"]},
            "AS":"TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult: any =
        { render: 'TABLE',
            result:
                [ { courses_id: '110', courseAverage: 85.46 },
                    { courses_id: '121', courseAverage: 84.56 },
                    { courses_id: '210', courseAverage: 86.15 },
                    { courses_id: '213', courseAverage: 81.76 },
                    { courses_id: '221', courseAverage: 86.47 },
                    { courses_id: '259', courseAverage: 75.82 },
                    { courses_id: '261', courseAverage: 69.1 },
                    { courses_id: '301', courseAverage: 88 },
                    { courses_id: '302', courseAverage: 79.46 },
                    { courses_id: '303', courseAverage: 77.62 },
                    { courses_id: '304', courseAverage: 85.5 },
                    { courses_id: '310', courseAverage: 81.88 },
                    { courses_id: '311', courseAverage: 80.15 },
                    { courses_id: '312', courseAverage: 85.13 },
                    { courses_id: '313', courseAverage: 82.27 },
                    { courses_id: '314', courseAverage: 82.58 },
                    { courses_id: '317', courseAverage: 75.56 },
                    { courses_id: '319', courseAverage: 88.39 },
                    { courses_id: '320', courseAverage: 72.78 },
                    { courses_id: '322', courseAverage: 78.34 },
                    { courses_id: '340', courseAverage: 77.93 },
                    { courses_id: '344', courseAverage: 81.18 },
                    { courses_id: '404', courseAverage: 77.95 },
                    { courses_id: '410', courseAverage: 80.18 },
                    { courses_id: '411', courseAverage: 85 },
                    { courses_id: '415', courseAverage: 73.37 },
                    { courses_id: '416', courseAverage: 79.31 },
                    { courses_id: '418', courseAverage: 79.87 },
                    { courses_id: '420', courseAverage: 78.32 },
                    { courses_id: '421', courseAverage: 79.88 },
                    { courses_id: '422', courseAverage: 78.3 },
                    { courses_id: '425', courseAverage: 77.68 },
                    { courses_id: '430', courseAverage: 80.55 },
                    { courses_id: '444', courseAverage: 80.62 },
                    { courses_id: '445', courseAverage: 91.25 },
                    { courses_id: '449', courseAverage: 93.5 },
                    { courses_id: '490', courseAverage: 92.4 },
                    { courses_id: '500', courseAverage: 86.33 },
                    { courses_id: '501', courseAverage: 92.75 },
                    { courses_id: '502', courseAverage: 86.2 },
                    { courses_id: '503', courseAverage: 89.1 },
                    { courses_id: '507', courseAverage: 91.79 },
                    { courses_id: '509', courseAverage: 88 },
                    { courses_id: '513', courseAverage: 89.09 },
                    { courses_id: '515', courseAverage: 82.15 },
                    { courses_id: '521', courseAverage: 87.78 },
                    { courses_id: '522', courseAverage: 90.71 },
                    { courses_id: '527', courseAverage: 83.78 },
                    { courses_id: '540', courseAverage: 91.22 },
                    { courses_id: '543', courseAverage: 89.75 },
                    { courses_id: '544', courseAverage: 86.71 },
                    { courses_id: '547', courseAverage: 88.47 },
                    { courses_id: '589', courseAverage: 95 } ] }
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });

    it("Should be able to query - MIN", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
            "GROUP": [ "courses_id" ],
            "APPLY": [ {"courseAverage": {"MIN": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courses_id", "courseAverage"]},
            "AS":"TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult: any =
        { render: 'TABLE',
            result:
                [ { courses_id: '110', courseAverage: 67.79 },
                    { courses_id: '121', courseAverage: 69.73 },
                    { courses_id: '210', courseAverage: 68.13 },
                    { courses_id: '213', courseAverage: 64.62 },
                    { courses_id: '221', courseAverage: 65.1 },
                    { courses_id: '259', courseAverage: 74.22 },
                    { courses_id: '261', courseAverage: 67.91 },
                    { courses_id: '301', courseAverage: 71 },
                    { courses_id: '302', courseAverage: 73.18 },
                    { courses_id: '303', courseAverage: 70.16 },
                    { courses_id: '304', courseAverage: 71.89 },
                    { courses_id: '310', courseAverage: 72.27 },
                    { courses_id: '311', courseAverage: 74.06 },
                    { courses_id: '312', courseAverage: 76.84 },
                    { courses_id: '313', courseAverage: 70.46 },
                    { courses_id: '314', courseAverage: 67.85 },
                    { courses_id: '317', courseAverage: 68.54 },
                    { courses_id: '319', courseAverage: 78.93 },
                    { courses_id: '320', courseAverage: 67.76 },
                    { courses_id: '322', courseAverage: 67.48 },
                    { courses_id: '340', courseAverage: 68.4 },
                    { courses_id: '344', courseAverage: 75.91 },
                    { courses_id: '404', courseAverage: 69.58 },
                    { courses_id: '410', courseAverage: 74.25 },
                    { courses_id: '411', courseAverage: 72.24 },
                    { courses_id: '415', courseAverage: 68.79 },
                    { courses_id: '416', courseAverage: 72 },
                    { courses_id: '418', courseAverage: 75.61 },
                    { courses_id: '420', courseAverage: 68.77 },
                    { courses_id: '421', courseAverage: 74.68 },
                    { courses_id: '422', courseAverage: 68.84 },
                    { courses_id: '425', courseAverage: 72.48 },
                    { courses_id: '430', courseAverage: 73.25 },
                    { courses_id: '444', courseAverage: 78.42 },
                    { courses_id: '445', courseAverage: 73.88 },
                    { courses_id: '449', courseAverage: 88.5 },
                    { courses_id: '490', courseAverage: 89 },
                    { courses_id: '500', courseAverage: 78.87 },
                    { courses_id: '501', courseAverage: 84.67 },
                    { courses_id: '502', courseAverage: 81.06 },
                    { courses_id: '503', courseAverage: 87.36 },
                    { courses_id: '507', courseAverage: 84.75 },
                    { courses_id: '509', courseAverage: 84.25 },
                    { courses_id: '513', courseAverage: 64 },
                    { courses_id: '515', courseAverage: 79.88 },
                    { courses_id: '521', courseAverage: 82.65 },
                    { courses_id: '522', courseAverage: 82.55 },
                    { courses_id: '527', courseAverage: 83.78 },
                    { courses_id: '540', courseAverage: 82.82 },
                    { courses_id: '543', courseAverage: 85.35 },
                    { courses_id: '544', courseAverage: 82.28 },
                    { courses_id: '547', courseAverage: 88.47 },
                    { courses_id: '589', courseAverage: 75 } ] }
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });

    it("Should be able to query - COUNT", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult: any =
        { render: 'TABLE',
            result:
                [ { courses_dept: 'cpsc', courses_id: '527', numSections: 2 },
                    { courses_dept: 'cpsc', courses_id: '547', numSections: 2 },
                    { courses_dept: 'cpsc', courses_id: '418', numSections: 4 },
                    { courses_dept: 'cpsc', courses_id: '515', numSections: 4 },
                    { courses_dept: 'cpsc', courses_id: '261', numSections: 6 },
                    { courses_dept: 'cpsc', courses_id: '503', numSections: 6 },
                    { courses_dept: 'cpsc', courses_id: '507', numSections: 6 },
                    { courses_dept: 'cpsc', courses_id: '522', numSections: 6 },
                    { courses_dept: 'cpsc', courses_id: '259', numSections: 8 },
                    { courses_dept: 'cpsc', courses_id: '444', numSections: 8 },
                    { courses_dept: 'cpsc', courses_id: '501', numSections: 8 },
                    { courses_dept: 'cpsc', courses_id: '502', numSections: 8 },
                    { courses_dept: 'cpsc', courses_id: '509', numSections: 8 },
                    { courses_dept: 'cpsc', courses_id: '543', numSections: 8 },
                    { courses_dept: 'cpsc', courses_id: '449', numSections: 10 },
                    { courses_dept: 'cpsc', courses_id: '490', numSections: 10 },
                    { courses_dept: 'cpsc', courses_id: '521', numSections: 10 },
                    { courses_dept: 'cpsc', courses_id: '540', numSections: 10 },
                    { courses_dept: 'cpsc', courses_id: '301', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '302', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '303', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '311', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '312', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '319', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '340', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '410', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '411', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '415', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '416', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '420', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '421', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '422', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '425', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '445', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '500', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '513', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '544', numSections: 12 },
                    { courses_dept: 'cpsc', courses_id: '344', numSections: 13 },
                    { courses_dept: 'cpsc', courses_id: '589', numSections: 14 },
                    { courses_dept: 'cpsc', courses_id: '430', numSections: 16 },
                    { courses_dept: 'cpsc', courses_id: '314', numSections: 18 },
                    { courses_dept: 'cpsc', courses_id: '317', numSections: 18 },
                    { courses_dept: 'cpsc', courses_id: '404', numSections: 18 },
                    { courses_dept: 'cpsc', courses_id: '322', numSections: 22 },
                    { courses_dept: 'cpsc', courses_id: '320', numSections: 23 },
                    { courses_dept: 'cpsc', courses_id: '310', numSections: 26 },
                    { courses_dept: 'cpsc', courses_id: '313', numSections: 26 },
                    { courses_dept: 'cpsc', courses_id: '304', numSections: 30 },
                    { courses_dept: 'cpsc', courses_id: '213', numSections: 31 },
                    { courses_dept: 'cpsc', courses_id: '221', numSections: 37 },
                    { courses_dept: 'cpsc', courses_id: '210', numSections: 39 },
                    { courses_dept: 'cpsc', courses_id: '121', numSections: 43 },
                    { courses_dept: 'cpsc', courses_id: '110', numSections: 49 } ] };
        expect(ret).not.to.be.equal(null);
        expect(ret).to.deep.equal(expectedResult);
    });

    it("Galactica: Order of keys ordering should matter", function () {
        let query1: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let query2: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courses_id", "courseAverage"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller1 = new QueryController(datasets);
        let controller2 = new QueryController(datasets);
        let ret1 = controller1.query(query1);
        let ret2 = controller2.query(query2);
        expect(ret1).not.to.be.equal(null);
        expect(ret2).not.to.be.equal(null);
        expect(ret1).to.not.deep.equal(ret2);
    });

    it ("Should return an empty array if the dataset is empty", function() {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}},
            "GROUP": ["courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS": "TABLE"
        };
        let datasets: Datasets = {};
        let controller1 = new QueryController(datasets);
        let ret = controller1.query(query);
        let expectedResult = {render: query.AS, result: [{}]};
        expect(ret).to.deep.equal(expectedResult);
    });

    it ("Shoule be able to handle nested ANDs", function() {
        let dataset = [ { courses_dept: 'adhe', courses_id: '412', courses_avg: 70.53 },
            { courses_dept: 'adhe', courses_id: '412', courses_avg: 70.53 },
            { courses_dept: 'adhe', courses_id: '329', courses_avg: 70.56 },
            { courses_dept: 'adhe', courses_id: '329', courses_avg: 72.29 },
            { courses_dept: 'adhe', courses_id: '329', courses_avg: 72.93 },
            { courses_dept: 'adhe', courses_id: '329', courses_avg: 73.79 },
            { courses_dept: 'adhe', courses_id: '329', courses_avg: 75.67 },
            { courses_dept: 'adhe', courses_id: '412', courses_avg: 75.68 },
            { courses_dept: 'adhe', courses_id: '329', courses_avg: 75.91 },
            { courses_dept: 'adhe', courses_id: '412', courses_avg: 76.17 },
            { courses_dept: 'adhe', courses_id: '412', courses_avg: 76.22 }];

    });

    it("Should be able to query ROOM EXAMPLE 1", function () {
        let query: QueryRequest = {
            "GET": ["rooms_fullname", "rooms_number"],
            "WHERE": {"IS": {"rooms_shortname": "DMP"}},
            "ORDER": {"dir": "UP", "keys": ["rooms_number"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult = { render: 'TABLE',
            result:
                [ { rooms_fullname: 'Hugh Dempster Pavilion',
                    rooms_number: '101' },
                    { rooms_fullname: 'Hugh Dempster Pavilion',
                        rooms_number: '110' },
                    { rooms_fullname: 'Hugh Dempster Pavilion',
                        rooms_number: '201' },
                    { rooms_fullname: 'Hugh Dempster Pavilion',
                        rooms_number: '301' },
                    { rooms_fullname: 'Hugh Dempster Pavilion',
                        rooms_number: '310' } ] };
        expect(ret).to.deep.equal(expectedResult);

    });


    it("Should be able to query ROOM EXAMPLE 2", function () { // ordering does not matter
        let query: QueryRequest = {
            "GET": ["rooms_shortname", "numRooms"],
            "WHERE": {"GT": {"rooms_seats": 160}},
            "GROUP": [ "rooms_shortname" ],
            "APPLY": [ {"numRooms": {"COUNT": "rooms_name"}} ],
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        let expectedResult = { render: 'TABLE',
            result:
                [ { rooms_shortname: 'ANGU', numRooms: 1 },
                    { rooms_shortname: 'BIOL', numRooms: 1 },
                    { rooms_shortname: 'BUCH', numRooms: 2 },
                    { rooms_shortname: 'CHBE', numRooms: 1 },
                    { rooms_shortname: 'CHEM', numRooms: 2 },
                    { rooms_shortname: 'CIRS', numRooms: 1 },
                    { rooms_shortname: 'ESB', numRooms: 1 },
                    { rooms_shortname: 'FSC', numRooms: 1 },
                    { rooms_shortname: 'GEOG', numRooms: 1 },
                    { rooms_shortname: 'HEBB', numRooms: 1 },
                    { rooms_shortname: 'HENN', numRooms: 1 },
                    { rooms_shortname: 'LSC', numRooms: 2 },
                    { rooms_shortname: 'LSK', numRooms: 2 },
                    { rooms_shortname: 'MATH', numRooms: 1 },
                    { rooms_shortname: 'MCML', numRooms: 1 },
                    { rooms_shortname: 'OSBO', numRooms: 1 },
                    { rooms_shortname: 'PHRM', numRooms: 2 },
                    { rooms_shortname: 'SCRF', numRooms: 1 },
                    { rooms_shortname: 'SRC', numRooms: 3 },
                    { rooms_shortname: 'SWNG', numRooms: 4 },
                    { rooms_shortname: 'WESB', numRooms: 1 },
                    { rooms_shortname: 'WOOD', numRooms: 2 } ] };
        expect(ret).to.deep.equal(expectedResult);

    });

    it("Should be able to query ROOM EXAMPLE 3", function () {
        let query: QueryRequest = {
            "GET": ["rooms_fullname", "rooms_number", "rooms_seats"],
            "WHERE": {"AND": [
                {"GT": {"rooms_lat": 49.261292}},
                {"LT": {"rooms_lon": -123.245214}},
                {"LT": {"rooms_lat": 49.262966}},
                {"GT": {"rooms_lon": -123.249886}},
                {"IS": {"rooms_furniture": "*Movable Tables*"}}
            ]},
            "ORDER": { "dir": "UP", "keys": ["rooms_number"]},
            "AS": "TABLE"
        };
        let datasetController = new DatasetController();
        let datasets: Datasets = datasetController.getDatasets();
        let controller = new QueryController(datasets);
        let ret = controller.query(query);
        console.log(ret);

        let expectedResult = { render: 'TABLE',
            result:
            [ { rooms_fullname: 'Chemical and Biological Engineering Building',
                rooms_number: '103',
                rooms_seats: 60 },
                { rooms_fullname: 'Civil and Mechanical Engineering',
                    rooms_number: '1206',
                    rooms_seats: 26 },
                { rooms_fullname: 'Civil and Mechanical Engineering',
                    rooms_number: '1210',
                    rooms_seats: 22 },
                { rooms_fullname: 'MacLeod',
                    rooms_number: '214',
                    rooms_seats: 60 },
                { rooms_fullname: 'MacLeod',
                    rooms_number: '220',
                    rooms_seats: 40 },
                { rooms_fullname: 'MacLeod',
                    rooms_number: '242',
                    rooms_seats: 60 },
                { rooms_fullname: 'MacLeod',
                    rooms_number: '254',
                    rooms_seats: 84 } ] };

        expect(ret).to.deep.equal(expectedResult);

    });
    // it ("Should be able to handle Cyclone query", function() {
    //    let query: QueryRequest = {
    //         "GET": ["courses_dept", "courses_id", "courses_instructor"],
    //         "WHERE": {
    //         "OR": [
    //             {"AND": [
    //                 {"GT": {"courses_avg": 70}},
    //                 {"IS": {"courses_dept": "cp*"}},
    //                 {"NOT": {"IS": {"courses_instructor": "murphy, gail"}}}
    //             ]},
    //             {"IS": {"courses_instructor": "*gregor*"}}
    //         ]
    //     },
    //         "AS": "TABLE"
    //     };
    //     let datasetController = new DatasetController();
    //     let datasets: Datasets = datasetController.getDatasets();
    //     let controller = new QueryController(datasets);
    //     let ret = controller.query(query);
    //     let expectedResult: any = {{
    //         "render": "TABLE"
    //         "result": [
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "mcgrenere, joanna"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "greif, chen"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "greif, chen"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "garcia, ronald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "aiello, william"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "carter, paul martin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "carter, paul martin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "carter, paul martin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "garcia, ronald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "little, james joseph"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "garcia, ronald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "mcgrenere, joanna"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "garcia, ronald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "carter, paul martin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "mcgrenere, joanna"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "cooper, kendra"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "tompkins, david a d"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "voll, kimberly"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "voll, kimberly"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "woodham, robert"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "dulat, margaret"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "dulat, margaret"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "121"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "hutchinson, norman"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "baniassad, elisa"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "carter, paul martin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "baniassad, elisa"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "baniassad, elisa"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "carter, paul martin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "carter, paul martin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "carter, paul martin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "carter, paul martin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "beschastnikh, ivan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "carter, paul martin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "hutchinson, norman"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "carter, paul martin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "210"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "munzner, tamara"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": "warfield, andrew"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "213"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "evans, william"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "hu, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "cooper, kendra"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "hu, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "khosravi, hassan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "voll, kimberly"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "evans, william"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "voll, kimberly"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "voll, kimberly"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "voll, kimberly"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "harvey, nicholas"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "evans, william"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "evans, william"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "hu, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": "voll, kimberly"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "221"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "259"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "259"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "259"
    //                 "courses_instructor": "khosravi, hassan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "259"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "259"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "259"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "259"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "259"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "301"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "301"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "301"
    //                 "courses_instructor": "mitchell, ian"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "301"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "301"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "301"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "301"
    //                 "courses_instructor": "mitchell, ian"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "301"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "301"
    //                 "courses_instructor": "mitchell, ian"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "301"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "301"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "301"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "302"
    //                 "courses_instructor": "ascher, uri michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "302"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "302"
    //                 "courses_instructor": "ascher, uri michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "302"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "302"
    //                 "courses_instructor": "rees, tyrone"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "302"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "302"
    //                 "courses_instructor": "ascher, uri michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "302"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "302"
    //                 "courses_instructor": "ascher, uri michael;greif, chen"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "302"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "302"
    //                 "courses_instructor": "greif, chen"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "302"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "303"
    //                 "courses_instructor": "mitchell, ian"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "303"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "303"
    //                 "courses_instructor": "greif, chen"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "303"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "303"
    //                 "courses_instructor": "ascher, uri michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "303"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "303"
    //                 "courses_instructor": "greif, chen"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "303"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "303"
    //                 "courses_instructor": "ascher, uri michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "303"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "303"
    //                 "courses_instructor": "mitchell, ian"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "303"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "pottinger, rachel"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "lakshmanan, laks"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "pottinger, rachel"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "ng, raymond tak-yan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "pottinger, rachel"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "ng, raymond tak-yan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "khosravi, hassan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "pottinger, rachel"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "lakshmanan, laks"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "lakshmanan, laks"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "304"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "ernst, neil"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "ernst, neil"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "palyart-lamarche, marc"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "baniassad, elisa"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "fritz, thomas"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "baniassad, elisa"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "wohlstadter, eric"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "310"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "311"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "311"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "311"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "311"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "311"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "311"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "311"
    //                 "courses_instructor": "de volder, kris"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "311"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "311"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "311"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "311"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "311"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "312"
    //                 "courses_instructor": "voll, kimberly"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "312"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "312"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "312"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "312"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "312"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "312"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "312"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "312"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "312"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "312"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "312"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "acton, donald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "warfield, andrew"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "acton, donald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "acton, donald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "acton, donald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": "feeley, michael"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "313"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": "sheffer, alla"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": "bridson, robert"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": "van de panne, michiel"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": "pai, dinesh"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": "heidrich, wolfgang"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": "bridson, robert"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": "munzner, tamara"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": "sheffer, alla"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": "pai, dinesh"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": "sheffer, alla"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": "munzner, tamara"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "314"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": "aiello, william"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": "acton, donald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": "hutchinson, norman"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": "acton, donald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": "hutchinson, norman"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": "krasic, charles"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": "vuong, son"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": "aiello, william"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": "aiello, william"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "317"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "319"
    //                 "courses_instructor": "voll, kimberly"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "319"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "319"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "319"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "319"
    //                 "courses_instructor": "voll, kimberly"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "319"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "319"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "319"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "319"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "319"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "319"
    //                 "courses_instructor": "eiselt, kurt"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "319"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": "malka, lior"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": "schroeder, jonatan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": "belleville, patrice"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": "meyer, irmtraud margret"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "320"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "mackworth, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "little, james joseph"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "conati, cristina"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "conati, cristina"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "hutter, frank"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "leyton-brown, kevin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "carenini, giuseppe"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "conati, cristina"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "carenini, giuseppe"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "conati, cristina"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "carenini, giuseppe"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "mackworth, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "carenini, giuseppe"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "322"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "340"
    //                 "courses_instructor": "de freitas, joao"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "340"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "340"
    //                 "courses_instructor": "ng, raymond tak-yan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "340"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "340"
    //                 "courses_instructor": "de freitas, joao"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "340"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "340"
    //                 "courses_instructor": "ng, raymond tak-yan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "340"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "340"
    //                 "courses_instructor": "de freitas, joao"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "340"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "344"
    //                 "courses_instructor": "maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "344"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "344"
    //                 "courses_instructor": "dawson, jessica"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "344"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "344"
    //                 "courses_instructor": "maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "344"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "344"
    //                 "courses_instructor": "maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "344"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "344"
    //                 "courses_instructor": "maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "344"
    //                 "courses_instructor": "dawson, jessica;maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "344"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "344"
    //                 "courses_instructor": "maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "344"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": "lakshmanan, laks"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": "lakshmanan, laks"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "404"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "410"
    //                 "courses_instructor": "wohlstadter, eric"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "410"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "410"
    //                 "courses_instructor": "baniassad, elisa"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "410"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "410"
    //                 "courses_instructor": "wohlstadter, eric"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "410"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "410"
    //                 "courses_instructor": "murphy-hill, emerson"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "410"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "410"
    //                 "courses_instructor": "baniassad, elisa"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "410"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "410"
    //                 "courses_instructor": "ernst, neil"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "410"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "411"
    //                 "courses_instructor": "hutchinson, norman"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "411"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "411"
    //                 "courses_instructor": "hutchinson, norman"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "411"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "411"
    //                 "courses_instructor": "hutchinson, norman"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "411"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "411"
    //                 "courses_instructor": "de volder, kris"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "411"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "411"
    //                 "courses_instructor": "hutchinson, norman"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "411"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "411"
    //                 "courses_instructor": "hutchinson, norman"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "411"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "415"
    //                 "courses_instructor": "acton, donald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "415"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "415"
    //                 "courses_instructor": "acton, donald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "415"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "415"
    //                 "courses_instructor": "acton, donald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "415"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "415"
    //                 "courses_instructor": "acton, donald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "415"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "416"
    //                 "courses_instructor": "wagner, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "416"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "416"
    //                 "courses_instructor": "acton, donald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "416"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "416"
    //                 "courses_instructor": "wagner, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "416"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "416"
    //                 "courses_instructor": "acton, donald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "416"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "416"
    //                 "courses_instructor": "wagner, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "416"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "416"
    //                 "courses_instructor": "wagner, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "416"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "418"
    //                 "courses_instructor": "greenstreet, mark"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "418"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "418"
    //                 "courses_instructor": "greenstreet, mark"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "418"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "420"
    //                 "courses_instructor": "kirkpatrick, david"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "420"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "420"
    //                 "courses_instructor": "kirkpatrick, david"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "420"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "420"
    //                 "courses_instructor": "kirkpatrick, david"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "420"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "421"
    //                 "courses_instructor": "friedman, joel"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "421"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "421"
    //                 "courses_instructor": "friedman, joel"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "421"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "421"
    //                 "courses_instructor": "friedman, joel"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "421"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "421"
    //                 "courses_instructor": "friedman, joel"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "421"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "421"
    //                 "courses_instructor": "harvey, nicholas"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "421"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "421"
    //                 "courses_instructor": "harvey, nicholas"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "421"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "422"
    //                 "courses_instructor": "poole, david"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "422"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "422"
    //                 "courses_instructor": "carenini, giuseppe"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "422"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "422"
    //                 "courses_instructor": "poole, david"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "422"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "422"
    //                 "courses_instructor": "carenini, giuseppe"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "422"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "422"
    //                 "courses_instructor": "poole, david"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "422"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "425"
    //                 "courses_instructor": "woodham, robert"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "425"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "425"
    //                 "courses_instructor": "woodham, robert"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "425"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "425"
    //                 "courses_instructor": "woodham, robert"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "425"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "425"
    //                 "courses_instructor": "little, james joseph"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "425"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "425"
    //                 "courses_instructor": "little, james joseph"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "425"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "425"
    //                 "courses_instructor": "woodham, robert"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "425"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": "leyton-brown, kevin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": "leyton-brown, kevin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": "luk, joseph"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": "luk, joseph"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": "luk, joseph"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": "voll, kimberly"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": "leyton-brown, kevin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": "leyton-brown, kevin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "430"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "444"
    //                 "courses_instructor": "mcgrenere, joanna"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "444"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "444"
    //                 "courses_instructor": "mcgrenere, joanna"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "444"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "444"
    //                 "courses_instructor": "mcgrenere, joanna"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "444"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "444"
    //                 "courses_instructor": "mcgrenere, joanna"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "444"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "445"
    //                 "courses_instructor": "hoos, holger"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "445"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "445"
    //                 "courses_instructor": "manuch, jan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "445"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "445"
    //                 "courses_instructor": "meyer, irmtraud margret"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "445"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "445"
    //                 "courses_instructor": "meyer, irmtraud margret"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "445"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "445"
    //                 "courses_instructor": "manuch, jan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "445"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "445"
    //                 "courses_instructor": "kirkpatrick, bonnie;manuch, jan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "445"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "449"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "449"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "449"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "449"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "449"
    //                 "courses_instructor": "knorr, edwin max"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "449"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "449"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "449"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "449"
    //                 "courses_instructor": "tsiknis, georgios"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "449"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "490"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "490"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "490"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "490"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "490"
    //                 "courses_instructor": "wolfman, steven"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "490"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "490"
    //                 "courses_instructor": "allen, meghan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "490"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "490"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "490"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "500"
    //                 "courses_instructor": "evans, william"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "500"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "500"
    //                 "courses_instructor": "kirkpatrick, david"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "500"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "500"
    //                 "courses_instructor": "evans, william"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "500"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "500"
    //                 "courses_instructor": "evans, william"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "500"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "500"
    //                 "courses_instructor": "friedman, joel"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "500"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "500"
    //                 "courses_instructor": "evans, william"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "500"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "501"
    //                 "courses_instructor": "friedman, joel"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "501"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "501"
    //                 "courses_instructor": "friedman, joel"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "501"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "501"
    //                 "courses_instructor": "friedman, joel"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "501"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "501"
    //                 "courses_instructor": "harvey, nicholas"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "501"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "502"
    //                 "courses_instructor": "carenini, giuseppe"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "502"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "502"
    //                 "courses_instructor": "mackworth, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "502"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "502"
    //                 "courses_instructor": "poole, david"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "502"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "502"
    //                 "courses_instructor": "conati, cristina"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "502"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "503"
    //                 "courses_instructor": "carenini, giuseppe"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "503"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "503"
    //                 "courses_instructor": "carenini, giuseppe"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "503"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "503"
    //                 "courses_instructor": "carenini, giuseppe"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "503"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "507"
    //                 "courses_instructor": "wohlstadter, eric"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "507"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "507"
    //                 "courses_instructor": "wohlstadter, eric"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "507"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "507"
    //                 "courses_instructor": "wohlstadter, eric"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "507"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "509"
    //                 "courses_instructor": "garcia, ronald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "509"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "509"
    //                 "courses_instructor": "garcia, ronald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "509"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "509"
    //                 "courses_instructor": "garcia, ronald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "509"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "509"
    //                 "courses_instructor": "garcia, ronald"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "509"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "513"
    //                 "courses_instructor": "hu, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "513"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "513"
    //                 "courses_instructor": "hu, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "513"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "513"
    //                 "courses_instructor": "hu, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "513"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "513"
    //                 "courses_instructor": "hu, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "513"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "513"
    //                 "courses_instructor": "greenstreet, mark"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "513"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "515"
    //                 "courses_instructor": "mitchell, ian"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "515"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "515"
    //                 "courses_instructor": "mitchell, ian"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "515"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "521"
    //                 "courses_instructor": "wagner, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "521"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "521"
    //                 "courses_instructor": "greenstreet, mark"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "521"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "521"
    //                 "courses_instructor": "wagner, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "521"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "521"
    //                 "courses_instructor": "wagner, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "521"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "521"
    //                 "courses_instructor": "wagner, alan"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "521"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "522"
    //                 "courses_instructor": "poole, david"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "522"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "522"
    //                 "courses_instructor": "poole, david"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "522"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "522"
    //                 "courses_instructor": "poole, david"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "522"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "527"
    //                 "courses_instructor": "vuong, son"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "527"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "540"
    //                 "courses_instructor": "de freitas, joao"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "540"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "540"
    //                 "courses_instructor": "schmidt, mark"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "540"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "540"
    //                 "courses_instructor": "de freitas, joao"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "540"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "540"
    //                 "courses_instructor": "murphy, kevin"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "540"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "540"
    //                 "courses_instructor": "de freitas, joao"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "540"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "543"
    //                 "courses_instructor": "maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "543"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "543"
    //                 "courses_instructor": "maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "543"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "543"
    //                 "courses_instructor": "maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "543"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "543"
    //                 "courses_instructor": "maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "543"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "544"
    //                 "courses_instructor": "maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "544"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "544"
    //                 "courses_instructor": "dawson, jessica"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "544"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "544"
    //                 "courses_instructor": "maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "544"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "544"
    //                 "courses_instructor": "mcgrenere, joanna"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "544"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "544"
    //                 "courses_instructor": "maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "544"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "544"
    //                 "courses_instructor": "maclean, karon"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "544"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "547"
    //                 "courses_instructor": "munzner, tamara"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "547"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "589"
    //                 "courses_instructor": ""
    //             }
    //             {
    //                 "courses_dept": "apbi"
    //                 "courses_id": "328"
    //                 "courses_instructor": "stopps, gregory j"
    //             }
    //             {
    //                 "courses_dept": "apsc"
    //                 "courses_id": "160"
    //                 "courses_instructor": "knorr, edwin max;miller, gregor"
    //             }
    //             {
    //                 "courses_dept": "apsc"
    //                 "courses_id": "160"
    //                 "courses_instructor": "cooper, kendra;miller, gregor"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "411"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "411"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "411"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "411"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "511"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "511"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "511"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "511"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "511"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "511"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "513"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "513"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "513"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "513"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "arch"
    //                 "courses_id": "531"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "bama"
    //                 "courses_id": "541"
    //                 "courses_instructor": "silk, timothy;werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "bama"
    //                 "courses_id": "541"
    //                 "courses_instructor": "silk, timothy;werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "basc"
    //                 "courses_id": "524"
    //                 "courses_instructor": "werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "basc"
    //                 "courses_id": "550"
    //                 "courses_instructor": "werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "basc"
    //                 "courses_id": "550"
    //                 "courses_instructor": "werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "basc"
    //                 "courses_id": "550"
    //                 "courses_instructor": "werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "111"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "111"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "111"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "111"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "121"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "121"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "121"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "121"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "121"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "121"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "121"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "121"
    //                 "courses_instructor": "bole, gregory michael;cooke, james"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "140"
    //                 "courses_instructor": "bole, gregory michael;pollock, carol;sun, chin"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "230"
    //                 "courses_instructor": "crutsinger, gregory;goodey, wayne;jankowski, jill"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "230"
    //                 "courses_instructor": "crutsinger, gregory;goodey, wayne;jankowski, jill"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "300"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "300"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "300"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "306"
    //                 "courses_instructor": "bradfield, gary;crutsinger, gregory;goodey, wayne"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "306"
    //                 "courses_instructor": "bradfield, gary;crutsinger, gregory;goodey, wayne"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "317"
    //                 "courses_instructor": "stopps, gregory j"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "336"
    //                 "courses_instructor": "bole, gregory michael;keeling, naomi;whitton, jeannette"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "336"
    //                 "courses_instructor": "bole, gregory michael;keeling, naomi;whitton, jeannette"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "336"
    //                 "courses_instructor": "bole, gregory michael;whitton, jeannette"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "336"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "336"
    //                 "courses_instructor": "bole, gregory michael;draghi, jeremy"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "336"
    //                 "courses_instructor": "bole, gregory michael;draghi, jeremy"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "336"
    //                 "courses_instructor": "bole, gregory michael;weir, laura"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "336"
    //                 "courses_instructor": "bole, gregory michael;weir, laura"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "336"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "336"
    //                 "courses_instructor": "bole, gregory michael"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "336"
    //                 "courses_instructor": "adams, keith;bole, gregory michael;whitton, jeannette"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "336"
    //                 "courses_instructor": "adams, keith;bole, gregory michael;whitton, jeannette"
    //             }
    //             {
    //                 "courses_dept": "biol"
    //                 "courses_id": "411"
    //                 "courses_instructor": "crutsinger, gregory"
    //             }
    //             {
    //                 "courses_dept": "busi"
    //                 "courses_id": "291"
    //                 "courses_instructor": "werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "chem"
    //                 "courses_id": "123"
    //                 "courses_instructor": "dake, gregory;li, hongbin"
    //             }
    //             {
    //                 "courses_dept": "chem"
    //                 "courses_id": "203"
    //                 "courses_instructor": "dake, gregory"
    //             }
    //             {
    //                 "courses_dept": "chem"
    //                 "courses_id": "233"
    //                 "courses_instructor": "dake, gregory;stewart, jaclyn"
    //             }
    //             {
    //                 "courses_dept": "chem"
    //                 "courses_id": "233"
    //                 "courses_instructor": "dake, gregory;stewart, jaclyn"
    //             }
    //             {
    //                 "courses_dept": "chem"
    //                 "courses_id": "233"
    //                 "courses_instructor": "dake, gregory;stewart, jaclyn"
    //             }
    //             {
    //                 "courses_dept": "chem"
    //                 "courses_id": "233"
    //                 "courses_instructor": "dake, gregory;stewart, jaclyn"
    //             }
    //             {
    //                 "courses_dept": "chem"
    //                 "courses_id": "341"
    //                 "courses_instructor": "dake, gregory"
    //             }
    //             {
    //                 "courses_dept": "chem"
    //                 "courses_id": "341"
    //                 "courses_instructor": "dake, gregory"
    //             }
    //             {
    //                 "courses_dept": "chem"
    //                 "courses_id": "341"
    //                 "courses_instructor": "dake, gregory"
    //             }
    //             {
    //                 "courses_dept": "chem"
    //                 "courses_id": "341"
    //                 "courses_instructor": "dake, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "201"
    //                 "courses_instructor": "hall, eric;isaacson, michael d;johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "201"
    //                 "courses_instructor": "isaacson, michael d;johnson, gregory;staub-french, sheryl"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "201"
    //                 "courses_instructor": "berube, pierre;isaacson, michael d;johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "201"
    //                 "courses_instructor": "berube, pierre;isaacson, michael d;johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "202"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "215"
    //                 "courses_instructor": "lawrence, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "215"
    //                 "courses_instructor": "lawrence, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "215"
    //                 "courses_instructor": "lawrence, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "215"
    //                 "courses_instructor": "lawrence, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "215"
    //                 "courses_instructor": "lawrence, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "215"
    //                 "courses_instructor": "lawrence, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "445"
    //                 "courses_instructor": "howie, john;johnson, gregory;lo, kwang victor;ventura, carlos estuardo"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "478"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "478"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "478"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "478"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "civl"
    //                 "courses_id": "478"
    //                 "courses_instructor": "johnson, gregory"
    //             }
    //             {
    //                 "courses_dept": "comm"
    //                 "courses_id": "290"
    //                 "courses_instructor": "huh, woonghee tim;werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "comm"
    //                 "courses_id": "290"
    //                 "courses_instructor": "huh, woonghee tim;werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "comm"
    //                 "courses_id": "290"
    //                 "courses_instructor": "huh, woonghee tim;werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "comm"
    //                 "courses_id": "290"
    //                 "courses_instructor": "huh, woonghee tim;werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "comm"
    //                 "courses_id": "291"
    //                 "courses_instructor": "werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "comm"
    //                 "courses_id": "291"
    //                 "courses_instructor": "werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "comm"
    //                 "courses_id": "291"
    //                 "courses_instructor": "werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "comm"
    //                 "courses_id": "291"
    //                 "courses_instructor": "werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "comm"
    //                 "courses_id": "291"
    //                 "courses_instructor": "berkowitz, jonathan;werker, gregory"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "cpsc"
    //                 "courses_id": "110"
    //                 "courses_instructor": "kiczales, gregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "110"
    //                 "courses_instructor": "mackie, gregory"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "110"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "110"
    //                 "courses_instructor": "mackie, gregory"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "110"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "110"
    //                 "courses_instructor": "mackie, gregory"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "110"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "110"
    //                 "courses_instructor": "mackie, gregory"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "110"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "112"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "220"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "220"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "220"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "220"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "221"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "221"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "221"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "221"
    //                 "courses_instructor": "morgan, george macgregor"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "221"
    //                 "courses_instructor": "mackie, gregory"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "362"
    //                 "courses_instructor": "mackie, gregory"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "362"
    //                 "courses_instructor": "mackie, gregory"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "362"
    //                 "courses_instructor": "mackie, gregory"
    //             }
    //             {
    //                 "courses_dept": "engl"
    //                 "courses_id": "362"
    //                 "courses_instructor": "mackie, gregory"
    //             }
    //             {
    //                 "courses_dept": "eosc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "dipple, gregory"
    //             }
    //             {
    //                 "courses_dept": "eosc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "dipple, gregory"
    //             }
    //             {
    //                 "courses_dept": "eosc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "dipple, gregory"
    //             }
    //             {
    //                 "courses_dept": "eosc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "dipple, gregory"
    //             }
    //             {
    //                 "courses_dept": "eosc"
    //                 "courses_id": "322"
    //                 "courses_instructor": "dipple, gregory"
    //             }
    //             {
    //                 "courses_dept": "etec"
    //                 "courses_id": "521"
    //                 "courses_instructor": "mcgregor, heather"
    //             }
    //             {
    //                 "courses_dept": "frst"
    //                 "courses_id": "232"
    //                 "courses_instructor": "smith, gregory"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "102"
    //                 "courses_instructor": "bovis, michael j;henry, gregory h;tba"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "102"
    //                 "courses_instructor": "donner, simon;henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "102"
    //                 "courses_instructor": "hamdan, khaled;henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "102"
    //                 "courses_instructor": "hamdan, khaled;henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "307"
    //                 "courses_instructor": "henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "307"
    //                 "courses_instructor": "henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "307"
    //                 "courses_instructor": "henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "307"
    //                 "courses_instructor": "henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "307"
    //                 "courses_instructor": "henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "307"
    //                 "courses_instructor": "henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "309"
    //                 "courses_instructor": "eaton, brett;henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "309"
    //                 "courses_instructor": "christen, andreas;eaton, brett;henry, gregory h;koppes, michele"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "309"
    //                 "courses_instructor": "henry, gregory h;koppes, michele;moore, robert daniel"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "309"
    //                 "courses_instructor": "eaton, brett;henry, gregory h;mckendry, ian"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "409"
    //                 "courses_instructor": "henry, gregory h;koppes, michele"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "409"
    //                 "courses_instructor": "henry, gregory h;koppes, michele"
    //             }
    //             {
    //                 "courses_dept": "geob"
    //                 "courses_id": "500"
    //                 "courses_instructor": "eaton, brett;henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "321"
    //                 "courses_instructor": "gregory, derek john"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "321"
    //                 "courses_instructor": "gregory, derek john"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "321"
    //                 "courses_instructor": "gregory, derek john"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "321"
    //                 "courses_instructor": "gregory, derek john"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "321"
    //                 "courses_instructor": "gregory, derek john"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "345"
    //                 "courses_instructor": "gregory, derek john"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "345"
    //                 "courses_instructor": "gregory, derek john"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "345"
    //                 "courses_instructor": "gregory, derek john"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "345"
    //                 "courses_instructor": "gregory, derek john"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "345"
    //                 "courses_instructor": "gregory, derek john"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "345"
    //                 "courses_instructor": "gregory, derek john"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "353"
    //                 "courses_instructor": "feldman, gregory"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "353"
    //                 "courses_instructor": "feldman, gregory"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "446"
    //                 "courses_instructor": "feldman, gregory"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "497"
    //                 "courses_instructor": "henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "497"
    //                 "courses_instructor": "henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "497"
    //                 "courses_instructor": "henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "497"
    //                 "courses_instructor": "henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "geog"
    //                 "courses_id": "497"
    //                 "courses_instructor": "henry, gregory h"
    //             }
    //             {
    //                 "courses_dept": "math"
    //                 "courses_id": "101"
    //                 "courses_instructor": "martin, gregory"
    //             }
    //             {
    //                 "courses_dept": "math"
    //                 "courses_id": "101"
    //                 "courses_instructor": "martin, gregory"
    //             }
    //             {
    //                 "courses_dept": "math"
    //                 "courses_id": "101"
    //                 "courses_instructor": "martin, gregory"
    //             }
    //             {
    //                 "courses_dept": "math"
    //                 "courses_id": "223"
    //                 "courses_instructor": "martin, gregory"
    //             }
    //             {
    //                 "courses_dept": "math"
    //                 "courses_id": "223"
    //                 "courses_instructor": "martin, gregory"
    //             }
    //             {
    //                 "courses_dept": "math"
    //                 "courses_id": "437"
    //                 "courses_instructor": "martin, gregory"
    //             }
    //             {
    //                 "courses_dept": "math"
    //                 "courses_id": "537"
    //                 "courses_instructor": "martin, gregory"
    //             }
    //             {
    //                 "courses_dept": "math"
    //                 "courses_id": "539"
    //                 "courses_instructor": "martin, gregory"
    //             }
    //             {
    //                 "courses_dept": "math"
    //                 "courses_id": "539"
    //                 "courses_instructor": "martin, gregory"
    //             }
    //             {
    //                 "courses_dept": "musc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "butler, gregory g"
    //             }
    //             {
    //                 "courses_dept": "musc"
    //                 "courses_id": "121"
    //                 "courses_instructor": "butler, gregory g"
    //             }
    //             {
    //                 "courses_dept": "musc"
    //                 "courses_id": "454"
    //                 "courses_instructor": "butler, gregory g"
    //             }
    //             {
    //                 "courses_dept": "musc"
    //                 "courses_id": "454"
    //                 "courses_instructor": "butler, gregory g"
    //             }
    //             {
    //                 "courses_dept": "scie"
    //                 "courses_id": "113"
    //                 "courses_instructor": "bole, gregory michael;fox, joanne alison;han, andrea"
    //             }
    //             {
    //                 "courses_dept": "scie"
    //                 "courses_id": "113"
    //                 "courses_instructor": "bole, gregory michael;steyn, douw gerbrand"
    //             }
    //             {
    //                 "courses_dept": "scie"
    //                 "courses_id": "113"
    //                 "courses_instructor": "bole, gregory michael;fox, joanne alison;han, andrea"
    //             }
    //             {
    //                 "courses_dept": "thtr"
    //                 "courses_id": "330"
    //                 "courses_instructor": "mcgregor, chris;rodgers, sarah"
    //             }
    //             {
    //                 "courses_dept": "thtr"
    //                 "courses_id": "371"
    //                 "courses_instructor": "heatley, stephen;mcgregor, chris"
    //             }
    //             {
    //                 "courses_dept": "thtr"
    //                 "courses_id": "371"
    //                 "courses_instructor": "heatley, stephen;mcgregor, chris"
    //             }
    //             {
    //                 "courses_dept": "thtr"
    //                 "courses_id": "472"
    //                 "courses_instructor": "heatley, stephen;mcgregor, chris"
    //             }
    //             {
    //                 "courses_dept": "thtr"
    //                 "courses_id": "472"
    //                 "courses_instructor": "heatley, stephen;mcgregor, chris"
    //             }
    //             {
    //                 "courses_dept": "thtr"
    //                 "courses_id": "472"
    //                 "courses_instructor": "mcgregor, chris"
    //             }
    //             {
    //                 "courses_dept": "wood"
    //                 "courses_id": "241"
    //                 "courses_instructor": "smith, gregory"
    //             }
    //             {
    //                 "courses_dept": "wood"
    //                 "courses_id": "487"
    //                 "courses_instructor": "smith, gregory"
    //             }
    //             {
    //                 "courses_dept": "wood"
    //                 "courses_id": "487"
    //                 "courses_instructor": "smith, gregory"
    //             }
    //             {
    //                 "courses_dept": "wood"
    //                 "courses_id": "487"
    //                 "courses_instructor": "smith, gregory"
    //             }
    //             {
    //                 "courses_dept": "wood"
    //                 "courses_id": "487"
    //                 "courses_instructor": "smith, gregory"
    //             }
    //             {
    //                 "courses_dept": "wood"
    //                 "courses_id": "487"
    //                 "courses_instructor": "smith, gregory"
    //             }
    //         ]
    //     }};
    //
    //     expect(ret).not.to.be.equal(null);
    //     expect(ret).to.deep.equal(expectedResult);
    // });
});