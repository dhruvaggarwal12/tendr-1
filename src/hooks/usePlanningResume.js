import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { saveResumeUrl, tryCreateEarlyEventPlan } from '../utils/planningResume';

// Drop this hook into any booking-flow page.
// On mount it:
//   1. Saves the current URL so "Continue Planning" knows where to return.
//   2. Tries to create an early EventPlan in admin Bookings (once per session,
//      only if the customer has filled in event details earlier in the flow).
//
// Pass an explicit `url` if the natural pathname doesn't capture enough state
// (e.g. when step or filter params matter).
export default function usePlanningResume(url) {
  const token       = useSelector(s => s.auth?.token);
  const eventPlanning = useSelector(s => s.eventPlanning);

  useEffect(() => {
    saveResumeUrl(url);
    tryCreateEarlyEventPlan(token, eventPlanning);
    // run once on mount — deps intentionally empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
