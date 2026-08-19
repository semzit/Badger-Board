import { useBoardQuery, useSessionQuery } from "@badger-board/hooks/boardQueries";

export function useBoardData() {
  const session = useSessionQuery();
  const board = useBoardQuery(session.data?.building);
  return { session, board };
}
