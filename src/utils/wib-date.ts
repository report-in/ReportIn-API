import { toZonedTime } from 'date-fns-tz';

export function getWIBDate(): string {
  const timeZone = 'Asia/Jakarta';
  const now = new Date();

  const zoned = toZonedTime(now, timeZone);

  const year = zoned.getFullYear();
  const month = String(zoned.getMonth() + 1).padStart(2, '0');
  const day = String(zoned.getDate()).padStart(2, '0');
  const hour = String(zoned.getHours()).padStart(2, '0');
  const minute = String(zoned.getMinutes()).padStart(2, '0');
  const second = String(zoned.getSeconds()).padStart(2, '0');
  const millis = String(zoned.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millis}Z`;
}
