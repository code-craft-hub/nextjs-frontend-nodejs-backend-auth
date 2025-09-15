export const useGetPageUrl = () => {
  const { host, hostname, href, origin, pathname, port, protocol, search } =
    new URL(window.location.href);
  return { host, hostname, href, origin, pathname, port, protocol, search };
};