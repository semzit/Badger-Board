import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import type { LatLon } from "@badger/shared";
import { createSession, getBoard } from "@badger-board/lib/api";
import { isApiError } from "@badger-board/lib/apiClient";

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

export function useSessionQuery() {
  const navigate = useNavigate();

  return useQuery({
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
}

export function useBoardQuery(building: string | undefined) {
  return useQuery({
    queryKey: ["board", building],
    queryFn: () => getBoard(building!),
    enabled: building != null,
    retry: 1,
  });
}
