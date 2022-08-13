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

  resolve?: (value: unknown) => void;
  reject?: () => void;
  promise?: Promise<unknown>;
  status: 'pending' | 'running' | 'errored' | 'success' = 'pending';

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

function buildUI(details) {
  let uiForModule = (moduleInfo) => {
    let testInstances = moduleInfo.tests
      .map((testInfo) => {
        return tests.find(test => test.name === testInfo.name)
      })
      .filter(Boolean);

    return {
      title: moduleInfo.name,
      task: () => new Listr(testInstances.map(test => {
        return {
          title: test.name,
          skip: () => test.info.skip,
          task: () => test.promise,
        }
      })),
    }
  }

  ui = new Listr(details.modules.map(uiForModule));
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
        readTests(details);
        buildUI(details);
        ui.run();
        break;
      }
      case 'done': {
        console.info('');
        console.info(`Completed in ${details.runtime} ms`)
        console.info(`  Passed: ${details.passed}`);
        console.info(`  Failed: ${details.failed}`);
        console.info(`   Total: ${details.total}`);
        if (process.env.VITE_CI) {
          if (details.failed === 0) {
            process.exit(0);
          } else {
            process.exit(1);
          }
        }
        break;
      }
      case 'testStart': {
        tests.find(x => x.name === details.name)?.start();
        break;
      }
      case 'testDone': {
        tests.find(x => x.name === details.name)?.finish(details);
        break;
      }
    }
  }

  next();
};
