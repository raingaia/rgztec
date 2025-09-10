export function canonicalize(obj) {
  return JSON.stringify(sort(obj));
}
function sort(x) {
  if (Array.isArray(x)) return x.map(sort);
  if (x && typeof x === 'object') {
    return Object.keys(x).sort().reduce((acc,k)=>{
      acc[k] = sort(x[k]);
      return acc;
    }, {});
  }
  return x;
}
