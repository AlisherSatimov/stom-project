import { useQuery } from "@tanstack/react-query";
import axios from "../utils/axiosInstance";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"; // 👈 QO‘SHILDI

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore); // 👈 QO‘SHILDI

export const useUpcomingNotifications = () => {
  return useQuery({
    queryKey: ["upcomingNotifications"],
    queryFn: async () => {
      try {
        const { data: notifications } = await axios.get(
          "/notification/find-all"
        );

        const today = dayjs().startOf("day");
        const threeDaysLater = today.add(3, "day").endOf("day");

        const upcoming = notifications.filter((item) => {
          const visitDate = dayjs(item.nextVisit, "DD/MM/YYYY", true);
          const valid = visitDate.isValid();
          const isInRange = visitDate.isSameOrBefore(threeDaysLater);

          return valid && isInRange;
        });

        return upcoming.length;
      } catch (error) {
        return 0;
      }
    },
    refetchInterval: 3 * 60 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
