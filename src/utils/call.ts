export const buildCallRoomId = (userA: string, userB: string) => {
  const [first, second] = [userA, userB].sort();
  return ["call", first, second].join("-");
};
