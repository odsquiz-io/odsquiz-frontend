import { useEffect, useState } from "react";
import { fetchInvitations, fetchMemberships } from "../initiatives/manage/api";
import type { Invitation, Membership } from "../initiatives/types";

type Participation = {
  token: string;
  invitations: Invitation[];
  memberships: Membership[];
  // Keeps the invitations section after its last answer, so focus and the result message have a place.
  hadInvitations: boolean;
  error?: string;
};

export function useParticipation(token: string | null | undefined) {
  const [state, setState] = useState<Participation>();

  useEffect(() => {
    if (!token) {
      return;
    }

    let isCurrent = true;

    Promise.all([fetchInvitations(token), fetchMemberships(token)])
      .then(([invitations, memberships]) => {
        if (isCurrent) {
          setState({
            token,
            invitations,
            memberships,
            hadInvitations: invitations.length > 0,
          });
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setState({
            token,
            invitations: [],
            memberships: [],
            hadInvitations: false,
            error:
              error instanceof TypeError
                ? "Não foi possível conectar ao servidor."
                : error instanceof Error
                  ? error.message
                  : "Algo deu errado.",
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [token]);

  const participation = state?.token === token ? state : undefined;

  function update(change: (current: Participation) => Partial<Participation>) {
    setState((current) => (current ? { ...current, ...change(current) } : current));
  }

  return {
    participation,
    accepted(invitationId: string, membership: Membership) {
      update((current) => ({
        invitations: current.invitations.filter(({ id }) => id !== invitationId),
        memberships: [membership, ...current.memberships],
      }));
    },
    declined(invitationId: string) {
      update((current) => ({
        invitations: current.invitations.filter(({ id }) => id !== invitationId),
      }));
    },
    left(membershipId: string) {
      update((current) => ({
        memberships: current.memberships.filter(
          ({ membership_id }) => membership_id !== membershipId,
        ),
      }));
    },
  };
}
