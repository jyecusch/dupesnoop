/*
MIT License

Copyright (c) 2024 Jye Cusch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
This code is a derivative of "go-humanize" by Dustin Sallings, used under MIT license.
https://github.com/dustin/go-humanize

Adapted to TypeScript with modifications.
*/


const humanizeBytes = (size: number, base: number, sizes: string[]): string => {
	if (size < base) {
    return `${size} B`;
  }

  const e = Math.floor(Math.log(size) / Math.log(base));
  const suffix = sizes[e];
  const val = size / Math.pow(base, e);

  const f = val < 10 ? val.toFixed(1) : Math.round(val).toString();

  return `${f} ${suffix}`;
}

export const bytesToHumanReadable = (size: number) => {
  const sizes = ["B", "kB", "MB", "GB", "TB"];
  return humanizeBytes(size, 1000, sizes)
}