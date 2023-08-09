import {Context, Schema, Session} from 'koishi'

export const name = 'pastry-master'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

const match1: RegExp = /^\s*\/(?<operation1>\p{Script_Extensions=Han}+)\s(?<operation2>\p{Script_Extensions=Han}+)$/u;
const match2: RegExp = /^\s*\/(?<operation>\p{Script_Extensions=Han}+)$/u;
const match3: RegExp = /^\s*\\(?<operation1>\p{Script_Extensions=Han}+)\s(?<operation2>\p{Script_Extensions=Han}+)$/u;
const match4: RegExp = /^\s*\\(?<operation>\p{Script_Extensions=Han}+)$/u;

async function doSlash(session: Session, msgPart1: string, msgPart2: string, backslash: boolean = true) {
  let from = session.userId;
  let subject = <at id={from} />;

  let quote = session.quote;
  let object: any = null;

  if (quote) {
    let to = quote.userId;
    object = <at id={to} />;
  }

  let msg: any;
  if (msgPart2 && msgPart2 !== "") {
    if (object) {
      if (!backslash) {
        msg = <>{subject} {msgPart1}了 {object} {msgPart2}</>;
      } else {
        msg = <>{object} {msgPart1}了 {subject} {msgPart2}</>;
      }
    } else {
      if (!backslash) {
        msg = <>{subject} {msgPart1}了{msgPart2}</>;
      } else {
        msg = <>{subject} 被{msgPart1}了{msgPart2}</>;
      }
    }
  } else {
    if (object) {
      if (!backslash) {
        msg = <>{subject} {msgPart1}了 {object}</>;
      } else {
        msg = <>{object} {msgPart1}了 {subject}</>;
      }
    } else {
      if (!backslash) {
        msg = <>{subject} {msgPart1}了自己</>;
      } else {
        msg = <>{subject} 被自己{msgPart1}了</>;
      }
    }
  }

  await session.send(<><quote id={session.messageId} /> {msg}</>);
}

export function apply(ctx: Context) {
  ctx.on('message', async (session) => {
    let msg = session.content;

    if (session.quote && session.platform === 'onebot') {
      msg = session.elements.slice(1).toString();
    }

    let match = msg.match(match1);
    if (match && match.length == 3) {
      await doSlash(session, match[1], match[2], false);
    }

    match = msg.match(match2);
    if (match && match.length == 2) {
      await doSlash(session, match[1], "", false);
    }

    match = msg.match(match3);
    if (match && match.length == 3) {
      await doSlash(session, match[1], match[2], true);
    }

    match = msg.match(match4);
    if (match && match.length == 2) {
      await doSlash(session, match[1], "", true);
    }
  });
}
