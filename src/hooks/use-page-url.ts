export const useGetPageUrl = () => {
  // if (typeof window === "undefined") {
  //   return null;
  // }
  const { host, hostname, href, origin, pathname, port, protocol, search } =
    new URL(window.location.href);
  return { host, hostname, href, origin, pathname, port, protocol, search };
};
