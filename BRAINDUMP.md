# Braindump

## Origin

The idea of this app began as a disussion around how to best 'stress-test' Expo/RN in a similar manner to which an actual production RN app would stress the framework. The idea for that app would come to be a social platform with an initial purpose to replace or fill a similar role to the `#random` channel in Slack. We also discussed a few key UX decisions that we wanted to make which would make it a much more enjoyable platform than some of the currently existing solutions. For example, one of those decisions would be to use less whitespace and allow as much content to be on the screen as possible. And such, pound-random (soon after rebranded to Expo Blue) was born.

## Project Structure

The top-level projects contains two folders: `pound-random-app` and `server`. `pound-random-app` contains the app's client, an Expo/RN project. `server` contains the backend server. It was initially a RPC-like solution, but has now been translated into a `graphql-yoga` server.

### `./pound-random-app`

This is a pretty normal Expo app. The entry point is [`App.js`](./pound-random-app/App.js). The main libraries added to this project are [`styled-components`](https://www.styled-components.com/), [Apollo (Client/React)](https://www.apollographql.com/), and `react-navigation`. Most other dependencies are configuration for Apollo or just simple npm utility libraries like `lodash`. This project has a few subfolders, with subfolders of their own, namely: `assets`, `screens`, and `shared`. `assets` contains `./assets/fonts` (fonts), and a bunch of icons/images. I use `./assets/index.js` as a way to `require` an asset only once and just refer to it as a JS property from then on. I really like this pattern in ReasonML where all modules you write are global and you can just refer to modules by name `Assets.icon.xx` unlike in JS where you have to `import assets from '../../assets/'` in every file that you want to use that module in. The `screens` folder holds all of the components that are registered as screens in React Navigation. `shared` contains a bunch of components that aren't screen-specific and could be used in multiple places within the app.

### `./server`

The only subfolder in this Node.js app is `./pound-random-secret`, which is an ignored git submodule containing all of the launch codes. Other than that, each file is a domain-specific file related to whatever data it's named to be involving. There's also `./repl` and `./mysql-shell` which are really useful helpers written by Charlie. `./repl` lets you access and test the modules you've written in a quick way and `./mysql-shell` lets you access our database without ssh-ing into the box or navigation through a service's console. All GraphQL-related things live in `./typeDefs.js` (the schema and such) and `index.js` (the initialization of the GraphQL-yoga server).

## Expo/RN Challenges

### <Image />

The RN Image component has a few issues, mainly in terms of pure performance (or lack thereof) and how it loads/caches images. If your component has an image loaded from a remote uri, any time you rerender the component, the image will flicker to white and back even if the source remained constant. Also, having image content in a FlatList will make the app stutter and drop frames, especially on android.

### FlatList

This is also in tandem with the Image problem, but holding items in a flatlist that contain multimedia could cause scrolling performance to take major hits. Scrolling with a billion text views works perfectly, but once you throw a few images in there, RIP to your FPS. The culprit of its poor performance may be that its `renderItem` prop gets called in insane amount of times, causing image flickers or rerun code if you do any calculations in your item's render() function. I worked around this by making all internal views a class property rather than a function or even inlined JSX. See [`post.contentView`](./pound-random-app/shared/Post/index.js).

### ImagePicker

Cropping on iOS only allows for square edits, unlike the native photos app.

### Content Embeds

Without ejecting, it's impossible to embed native YouTube content, and you can't use TwitterKit for native Twitter Embeds, so you'd have to recreate Twitter Embeds using their API. Most other sites don't provide native content embedding modules, so the only options would be to link externally or to embed an Iframe, and with the current state of RN WebView, especially on iOS, it wouldn't be a great experience.

## Backend Challenges

This project was my first head-first foray into developing an application server that does more than collect a list of items. The groundwork was done by Charlie, but as I created more features and made the switch to GraphQL, I got to mold the server with my own hands.

### Timezones

I thought MySQL Datetime would be enough, but then Nikki sent a D-mail from the future and I realized that I hadn't accounted for other timezones. I ended up using MySQL's timestamp type instead, but that meant that any content created before that change was effectively lost in time.

### Polling

For some reason, enabling Polling on the Apollo client opened up a ton of connections to our MySQL db, often erroring out saying that I reached the maximum amount of connections although I was the only user hitting the database. To fix that, I implemented GraphQL subscriptions which serve data over websockets rather than hitting the server a few times per minute which seemed to have a hefty cost.

### UTF-8/Emoji

MySQL doesn't support emoji by default. Check `charset.sql` to see the alteration to the db that I needed to do to remedy that.

## Some Implementation Stuff

### `helpers.tokenizeContent`

Perhaps the most important section of code in this whole repo is the `tokenizeContent(s: String)` function. This takes a string of text (primarily from the app's KeyboardAccessory input), "parses", and creates an array of "tokens" which is an object with a `type` and `value` property. This is stored as a JSON column in the post mysql table. By using "tokens", I can add new content types without modifying the backend almost at all. Recently, I added a datatype for embedded tweet content by just creating a tweet token with its value being the JSON returned from the Twitter Status API. This approach may have been naive and there may be a better approach to the problem, but with a lot of our backend implementation, it was the easiest solution at the time that would enable more rapid development in the future.

### SQL Queries

Perhaps a more maintainable & stable way to write queries could be via Sequelize or something similar, as again we wrote our own sort-of orm/query thing quickly to get up and running in a swift fashion.

### Types

I wish I start writing this app in something typed (Flow, TypeScript, even ReasonML) as past and future bugs would be a lot easier to detect and prevent and would lead to much more robust code.

### Auth

Yeah there really isn't any auth/security in this app. all operations just require a userId and is extremely naive 😬

## Distribution

It's currently on Expo Client for Android, Testflight (Expo's account for internal and my own for external testers), and in a beta channel on my Play Store account. Let me know if you need a new build cut or just DIY 🤷‍

### TTI

Oh yeah and the TTI is really bad. Probably the result of me not writing well-optimized code.

- Juwan
