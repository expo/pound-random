export default function typedError(type, message) {
  let e = new Error(message);
  e.type = type;
  return e;
}