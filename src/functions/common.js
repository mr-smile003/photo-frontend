import { useLocation } from 'react-router-dom';

export function useQueryParam(param) {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  return query.get(param);
}