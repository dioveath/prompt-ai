import { useRef, useState } from "react";
import { Configuration, OpenAIApi } from "openai";



const configuration = new Configuration({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

function App() {
  const [reply, setReply] = useState<string>("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <form onClick={(e) => { e.preventDefault(); }} style={{ display: "flex", "flexDirection": "column"}}>
          <textarea ref={inputRef} />
          <button
            onClick={async (e) => {
              const completion = await openai.createCompletion({
                model: 'text-davinci-003',
                prompt: inputRef.current?.value,
                max_tokens: 256,                
              });
              const message: string = completion.data.choices[0].text ?? "";
              setReply(message);

              // const sseClient = new EventSource("https://api.openapi.com/v1/completions", {
              //   model: 'text-davinci-003',
              //   prompt: inputRef.current?.value,
              //   max_tokens: 256,
              // });
              

            }}
          >
            Type for prompt
          </button>
        </form>
        
        <div> { reply } </div>
      </div>
      
    </div>
  );
}

export default App;
