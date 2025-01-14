void import("./foo").then(
  ({ foo }) =>
  {
    console.log(foo);
  },
).catch(
  // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
  (err) =>
  {
    console.error(err);
  },
);
