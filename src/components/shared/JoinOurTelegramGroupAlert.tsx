
import { Alert, AlertTitle } from "@/components/ui/alert";

const JoinOurTelegramGroupAlert = () => {
  return (
    <section className="w-full mt-8">
       <a
          href="https://web.telegram.org/k/#@Cver_AI"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-4"
        >
          <Alert className="flex gap-4 w-full! items-center justify-center">
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
