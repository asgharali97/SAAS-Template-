import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

async function POST(req: Request) {
  const Webhook_Seceret = process.env.WEBHOOK_SECRET;

  if (!Webhook_Seceret) {
    throw new Error("webhook secert is not provided env key is not found");
  }

  const headersPayload = headers();
  //@ts-expect-error ignore
  const svix_id = headersPayload.get("svix-id");
  //@ts-expect-error ignroe
  const svix_timestamp = headersPayload.get("svix-timestamp");
  //@ts-expect-error ignroe
  const svix_signature = headersPayload.get("svix-signature");

  if(!svix_id || !svix_timestamp || !svix_signature){
     return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  } 
  const payload = await req.json();

  const body = JSON.stringify(payload);

  const wh = new Webhook(Webhook_Seceret);
  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id!,
      "svix-timestamp": svix_timestamp!,
      "svix-signature": svix_signature!,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Failed to verify webhook:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with ${id} and event type ${eventType} received.`);
  console.log(`webhook body:`, body);

  if (eventType === "user.created") {
    try {
      const { email_addresses, primary_email_address_id } = evt.data;
      console.log(evt.data);

      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      );

      if (!primaryEmail) {
        console.error("No primary email found");
        return new Response("No primary email found", { status: 400 });
      }

      const newUser = await prisma.user.create({
        data: {
          id: evt.data.id,
          email: primaryEmail.email_address,
          isSubscribed: false,
        },
      });

      console.log("new user created:", newUser);
    } catch (err) {
      console.error("Error while creating User in Database", err);
      return new Response("Error creating User", { status: 500 });
    }
  }
  return new Response("Webhook received successfully", { status: 200 });
}
