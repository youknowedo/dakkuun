import { eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { drizzle, web } from ".";
import { reminders } from "./schema";
import { isDown } from "./utils";

export const app = new Hono();

app.post("/dakkuun/down", async (c) => {
    return c.text((await isDown()) ? "down, hakkuun is!" : "up, hakkuun is!");
});

app.post("/dakkuun/remind", async (c) => {
    const db = await drizzle;

    const userId = (await c.req.formData()).get("user_id")?.toString();
    if (!userId)
        return c.text("hmmm. no user id, i found. message Sigfredo, you must.");

    const user = (
        await db.select().from(reminders).where(eq(reminders.id, userId))
    )[0];
    if (user) return c.text("remind you, i already will");

    const down = await isDown();
    if (!down) return c.text("up, hakkuun is!");

    await db.insert(reminders).values({
        id: userId,
    });

    return c.text("remind you, i will");
});
