export function generateEmoji() {
  const e1 = '😁😆😂🤣☺️😇🙃😉';
  const e2 = '😍😘😗😙😋😛😝😜🤪🤨🧐🤓😎🤩😏😭😤😡';
  const e3 = '🤯😳😱🤗🤔🤭🤫😶😐😑😬🙄😮😴🤤😪🤑🤠';
  const e4 = '😈👹👺🤡💩👻💀☠️👽👾🤖🎃';
  const e5 = '😸😹😻😼😽🙀';
  const emojis = e1 + e2 + e3 + e4 + e5
  return emojis.charAt(Math.floor(Math.random() * emojis.length));
}
