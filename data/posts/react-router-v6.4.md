---
title: "React Router 6.4 Release"
summary: "React Router 6.4 was released today, adding all of data loading, data mutation, pending navigation, and error handling APIs from Remix to every React Router app, and soon to any rendering library."
date: 2022-09-07
image: /blog-images/posts/remixing-react-router/image.jpg
imageAlt: Glowing React Router logo, 6 dots in an upward pyramid with a path of three from top to bottom connected.
authors:
  - Ryan Florence
---

After several months of development, the data APIs from Remix have arrived for React Router in v6.4.

Building highly dynamic web experiences that your users <small>(or at least your product team)</small> expect is quite difficult! Web developers who started with the web often talk about how simple it used to be. Truth is, it really was way easier back then to build some basic, data-driven pages. You know what else?

They were also _super boring_.<br/>

Today, the web is a wonderful place where [highly dynamic shopping experiences][tesla], [creative productivity software][figma], and yes, even [super boring but excellent classified ads][craigslist] are all possible on the same platform.

While these websites are all wildly different, they all of one thing in common: <b>data coupled to URLs</b>. It's not just about data loading either. All of these UIs have components that mutate and revalidate the data, too.

React Router 6.4 embraces this reality with new conventions, APIs, and automatic behaviors for:

- Loading data into components
- Updating data in components
- Managing race conditions and interruptions for navigations, mutations, and revalidation
- Managing errors and rendering something useful to the user
- Pending UI
- Skeleton UI
- and more...

So, whether your UI needs are super boring are highly dynamic, it's hard to explain just how much simpler and more capable your code becomes when your router understands both data loading and data mutations. You kind of have to experience it yourself. Take it for a spin today:

- [Feature Overview][featureoverview]
- [Tutorial][tutorial]

Happy routing!

[craigslist]: https://craigslist.com
[tesla]: https://www.tesla.com/model3/design
[figma]: https://figma.com
[remix]: /
[featureoverview]: https://reactrouter.com/en/main/getting-started/overview
[tutorial]: https://reactrouter.com/en/main/getting-started/tutorial
