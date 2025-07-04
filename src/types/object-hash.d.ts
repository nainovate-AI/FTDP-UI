declare module 'object-hash' {
  function hash(obj: any): string;
  namespace hash {
    function MD5(obj: any): string;
  }
  export = hash;
}
