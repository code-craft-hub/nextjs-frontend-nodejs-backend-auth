
import { Alert, AlertTitle } from "@/components/ui/alert";

const JoinOurTelegramGroupAlert = () => {
  return (
    <section className="mt-8 w-full">
       <a
          href="https://web.telegram.org/k/#@Cver_AI"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full  items-start gap-4"
        >
          <Alert className="flex items-center gap-4 w-full!">
            <div className="size-8 ">
              <img src="/telegram.svg" alt="" />
            </div>
            <AlertTitle>
              Join our new Telegram Channel for daily job notifications.
            </AlertTitle>
          </Alert>
        </a>
    </section>
  )
}

export default JoinOurTelegramGroupAlert
