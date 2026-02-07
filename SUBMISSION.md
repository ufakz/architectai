# AIChitect — Competition Submission

## Inspiration

AI has changed software. But how we *build* software has largely remained the same. We still write words, try to "code" in English, jumble incomplete sentences in trying to specify what we want to get built.

Engineers go on meetings with architects and designers. Hours get spent debating the best way to build the product. Sometimes agreements are reached. But what happens? Everyone goes back to their own cave and tries to build the version "they understand". Then more meetings are scheduled to realign again—wasting productive time for something that could have been done in a single meeting.

The question for me was: "Why don't we humans do what we do best and leave the machines to do what they do best?". Humans are excellent in systems thinking, connecting patterns and organizing workflows. So software should be built the same way. We should leverage the multimodal advances of the models to create a future where we go from diagrams to code. Instead of a spec as a source of truth, why couldn't a master diagram be? Just like architectural blueprints are for buildings.

As we go in meetings, discuss architectural tradeoffs and the connectivity between components, that knowledge should be immediately transformed into a ground truth. Instead of every engineer trying to figure out what the requirements are in their own "bat cave", let's make the meetings the decision board. We iterate faster, better, with everyone on the same page.

## What it does

AIChitect takes a diagram and transforms it to code via specifications.

1. User creates the diagrams specifying the different components of the application.
2. AIChitect creates a standardized version of the diagram and isolates the different components.
3. The user can edit the requirements in natural language and add their desired specifications.
4. A version-controlled master specification document is generated that can be used by any coding agent.
5. The user connects a GitHub repository to track the evolution of diagrams and specs.
6. Everything synced to the GitHub repo to enable seamless access from IDEs, cloud agents and development teams.

## How we built it

We used Google's Antigravity with Gemini 3 Pro to build AIChitect. In short, we used Gemini to create an app that uses Gemini.

We focused on leveraging three of Gemini's strong capabilities:

1. **Multimodal Understanding**: This enabled us to infer the application's requirements from the user's schematic diagrams.
2. **Multimodal Generation**: This enabled the generation of the reformed and consolidated diagrams from the user's sketches leveraging Imagen 3's state-of-the-art image generation capabilities.
3. **Technical Versatility**: Finally, using Gemini 3 Pro's deep understanding, we infer the application behavior from the created quality diagram creating the final version of the detailed software specification document.

## Challenges we ran into

1. **Consistency of results**: While Gemini is able to create rich and quality diagrams from the user's sketches, it required careful iteration and prompt specification to create a consistent look and technical information required for the diagrams created.

2. **Architectural Decisions**: Initially we brainstormed on whether to create AIChitect as a workflow, agent or software that uses GenAI. Finally, we decided to iterate by starting with the least complicated setup by creating a software that leverages GenAI to achieve a desired outcome. These architectural decisions are still in discussions and experiments on how AIChitect can be made further.

## Accomplishments that we're proud of

The thing we are most proud of is seeing the possibility of radically transforming how software is built using AIChitect. It gave us a glimpse into how high-bandwidth natural cognitive human processes of sketches can be leveraged to build and iterate on software faster.

Another accomplishment we are proud of is experimenting with multiple parts of the Gemini ecosystem including Gemini 3 Pro, Flash and Imagen 3 to create a workflow that leverages the multimodal strengths of Gemini.

## What we learned

The greatest lesson we learned was building requires iteration not perfection. The first version got us to see the idea working. Then we worked on prompt optimization, connectivity, versioning, connecting GitHub and UI polish.

Another thing we have learnt is that the limits of what can be built with generally intelligent multimodal models is only limited by our imagination and we are excited to build more. This applies to not only AIChitect, but all software in general.

## What's next for AIChitect

The roadmap we have for AIChitect is as follows:

1. Launch and test with real users to understand how users actually interact with it.
2. Perform testing and quantification of expected application behaviour with defined metrics such as precision of diagrams and specifications generated. Also, quantifying user intent understanding via relevance metrics of diagrams and specs generated.
3. Transform AIChitect to an agent workflow that iterates on user diagrams and requirements improving clarity and specification quality.
4. Complete the loop by including end-to-end code generation—integrating with IDE extensions and cloud-based coding agents to go from diagram to deployed software.
