import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import type { LatLon } from "@badger/shared";
import { createSession, getBoard, isApiError } from "@/lib/api";

function getCurrentPosition(): Promise<LatLon> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      reject,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}

/**
 * Resolves the current session (geolocation -> createSession) and the board
 * it grants access to. When the coordinates are outside every building the
 * API responds 404 and we redirect to /outside.
 */
export function useBoardData() {
  const navigate = useNavigate();

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const coords = await getCurrentPosition();
      try {
        return await createSession(coords);
      } catch (error) {
        if (isApiError(error) && error.status === 404) {
          navigate("/outside");
        }
        throw error;
      }
    },
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const boardQuery = useQuery({
    queryKey: ["board", sessionQuery.data?.building],
    queryFn: () => getBoard(sessionQuery.data!.building),
    enabled: sessionQuery.data != null,
    retry: 1,
  });

  return { session: sessionQuery, board: boardQuery };
}
