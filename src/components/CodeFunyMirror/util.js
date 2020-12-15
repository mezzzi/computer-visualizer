export const JACK_FRAGMENT_CODES = {
  printInt:
`// Simple program to print an integer
// Yes it has a print line

class Main {
  function void main () {
    do Output.printInt(2);
    return;
  }
}
`,
  printStirng:
`/** Hello world program */

class Main {
  function void main () {
    /* Print some text using standard library */
    do Output.printString("Hello world");
    do Output.println(); // New line
    return;
  }
}
`
}
