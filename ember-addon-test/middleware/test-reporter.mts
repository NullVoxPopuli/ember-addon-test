import { Connect } from "vite";
import Listr from 'listr';


let ui: Listr;

class Test {
  constructor(public name: string, public info: any) {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  task?: any;
  resolve?: (value: unknown) => void;
  reject?: () => void;
  promise?: Promise<unknown>;
  status: 'pending' | 'skipped' | 'running' | 'errored' | 'success' = 'pending';

  skip = () => {
    this.resolve?.(0);
    this.status = 'skipped';
    this.task?.skip();
  };

  start = () => this.status = 'running';

  finish = ({ failed, total, passed }) => {
    if (failed === 0) {
      this.resolve?.(total);
      this.status = 'success';
      return;
    }

    this.reject?.();
    this.status = 'errored';
  }
}
let tests: Test[] = [];

function readTests(details) {
  let t = details.modules.map(m => m.tests).flat();
  tests = t.map(info => new Test(info.name, info));
}

function taskForTest(test) {
  return {
    title: test.name,
    skip: () => test.info.skip,
    task: (ctx, task) => {
      test.task = task;
      return test.promise;
    },
  }
}

let moduleInfos = [];
let moduleTasks = {};

function startTest({ name, module, testId }) {
  let moduleInfo = moduleInfos.find(moduleInfo => moduleInfo.tests.some(test => test.testId === testId));

  if (!moduleInfo) {
    ui = new Listr([{
      title: name,
      task: () => {throw new Error(name)}
    }])
    ui.run().catch(() => { /* errors caught manually */ });
    return;
  }

  if (!ui) {
    ui = new Listr([]);
  }

  let moduleTask = moduleTasks[moduleInfo.moduleId];

  if (!moduleTask) {
    moduleTask = {
      title: moduleInfo.name,
      task: () => {
        let test = tests.find(test => test.info.testId === testId);
        let instance = new Listr([taskForTest(test)]);

        moduleTask.ui = instance;

        return instance;
      }
    }

    moduleTasks[moduleInfo.moduleId] = moduleTask;

    ui.add(moduleTask)
  } else {
    let test = tests.find(test => test.info.testId === testId);
    moduleTask.ui.add(taskForTest(test));
  }

  ui.run().catch(() => { /* errors caught manually */ });
}

/**
  * requires bodyParser.json()
  */
export const testReporter: Connect.NextHandleFunction = (req, res, next) => {
  if (req.method === 'POST' && req.url?.startsWith('/_test-status')) {
    if (!('body' in req)) {
      next();
      return;
    };

    let { details, status } = ( req as any ).body;

    switch (status) {
      case 'begin': {
        ui = null;
        tests = null;
        moduleTasks = {};
        moduleInfos = details.modules;
        console.clear();
        readTests(details);
        break;
      }
      case 'done': {

        // if any tests are still pending, it's possible
        // we just ran a single test. let's mark all the others
        // as skipped.
        tests
          .filter(test => test.status === 'pending')
          .forEach(test => test.skip());

        ui.add({
          title: `Completed in ${details.runtime}ms`,
          task: () => {
            if (details.failed > 0) {
              throw (new Error(`${details.failed} failed`));
            }

            return Promise.resolve();
          },
        });

        // if (process.env.VITE_CI) {
        //   if (details.failed === 0) {
        //     process.exit(0);
        //   } else {
        //     process.exit(1);
        //   }
        // }
        break;
      }
      case 'testStart': {
        startTest(details);
        tests.find(x => x.name === details.name)?.start();
        break;
      }
      case 'testDone': {
        tests.find(x => x.name === details.name)?.finish(details);
        break;
      }
    }

    res.statusCode = 200;
    res.end();
    return;
  }

  next();
};
