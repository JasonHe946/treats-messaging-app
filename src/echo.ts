import HTTPError from 'http-errors';

function echo(value: string) {
  if (value === 'echo') {
    // ITERATION 3
    throw HTTPError(400, 'Cannot echo "echo"');
    // ITERATION 2
    // return { error: 'error' };
  }
  return value;
}

export { echo };
