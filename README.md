# HttpCache

Http cache test code

# Run project

cd HttpCache
yarn install
yarn add -g nodemon
nodemon app.js

# http cache desc

> Http 四种缓存：Http 缓存分为 4 种，2 种强制缓存，2 种协商缓存

> 强制缓存 Expires：服务器返回资源时，设置一个过期时间到 http 响应 header，浏览器在响应头 Expires 中能看到这个时间，浏览器下次再请求这个资源时会如果时间小于 Expires 就会从缓存中获取不会向服务器发送 http 请求，当然服务器也不会收到 http 请求，否则再次向服务器发送 http 请求。

> 强制缓存 Expires 步骤以请求图片为例：
> step1) 浏览器向服务端发送 http 请求：get http://localhost/x.png
> step2) 服务端收到请求后，设置强制缓存的过期时间：response.setHeader('Expires', new Date("2024-12-04 15:19:56").toUTCString())；并把图片资源返回给客户端。
> step3) 客户端收到图片的响应后，同时 response header 中多了一个头：expires: Wed, 04 Dec 2024 07:19:56 GMT，这个时间就是 step2 中设置的时间
> step4）浏览器再次请求 get http://localhost/x.png， 此时的时间小于 expires 时间，不会发送 http 请求，会从浏览器的缓存种获取这个图片，浏览器网络工具里状态显示 200 且是灰色， 大小显示(内存缓存)也是灰色。如果大于这个时间那就继续回到步骤 step1

> 强制缓存 Expires 缺点：Expires 缓存设置一个绝对的过期时间，但是客户端与服务器的时间可能不同步会造成缓存不生效，如果能设置一个相对时间会更好一点，因此出现了第二个强制缓存 max-age

> 强制缓存"cache-control：max-age=5"：强制缓存 Expires 只在 http1.1 之前也支持，"cache-control：max-age"只在 http1.1 以后支持，cache-control：max-age=5 设置一个相对时间，5s 后强制缓存失效。

> 强制缓存 cache-control：max-age=步骤以请求图片为例：
> step1) 浏览器向服务端发送 http 请求：get http://localhost/x.png
> step2) 服务端收到请求后，设置强制缓存的相对过期时间：res.setHeader("cache-control", "max-age=5")；并把图片资源返回给客户端。
> step3) 客户端收到图片的响应后，同时 response header 中多了一个头：cache-control:max-age=5，这个相对时间就是 step2 中设置的相对时间
> step4）浏览器再次请求 get http://localhost/x.png， 此时的时间距离上次请求在 5s 以内，不会发送 http 请求，会从浏览器的缓存种获取这个图片，浏览器网络工具里状态显示 200 且是灰色， 大小显示(内存缓存)也是灰色。如果大于这个时间那就继续回到步骤 step1

> 强制缓存"cache-control：max-age"缺点："cache-control：max-age"强制缓存只看过期时间，有时候时间过期了但是图片内容并没有更改，此时最好也不要再次发送图片，否则会给服务器造成多余的工作。我们可以看检查图片内容是否发生了更改，这就是协议缓存要做的事

> 协商缓存概念：协议缓存与强制缓存不一样，强制缓存设置过期时间后由浏览器判断是否再次请求，如果没过期，不会建立 http 连接，而协议缓存不一样，无论协议缓存是否命中，都会建立 http 连接，由服务器端判断协议缓存是否命中，建立连接后服务端如果判断协议缓存命中直接返回 304，返回 304 后浏览器就会从内存中获取资源。否则再次发送资源内容。

> 判断资源更改时间的协商缓存(last-modified)：每次客户端请求资源时服务端判断一下图片的更改时间有没有变化来确定缓存是否命中，如果更改时间没变化之间返回 304，让浏览器自己从缓存种获取资源，否则就发送最新更改后的资源给浏览器。

> 协议缓存(last-modified)步骤：
> step1) 浏览器向服务端发送 http 请求：get http://localhost/x.png
> step2) 服务端收到请求后，从本地获取图片的更改时间，并设置响应头 last-modified：res.setHeader("last-modified", 图片更改时间.toUTCString());且更改缓存为协商缓存 res.setHeader("Cache-Control", "no-cache");，否则默认仍是强制缓存，并把图片资源返回给客户端。
> step3) 客户端收到图片的响应后，同时 response header 中多了一个 last-modified 头：last-modified:
> Wed, 04 Dec 2024 05:02:08 GMT，这个时间就是 step2 中设置的图片的最后一次修改时间
> step4）浏览器再次请求 get http://localhost/x.png，此时一定会建立 http 连接，这里跟强制缓存不一样，建立连接后请求头里会多一个 if-modified-since 请求头：if-modified-since:Wed, 04 Dec 2024 05:02:08 GMT，这个请求头的时间与 step2 和 step3 的时间都是同一个时间，都是图片最后一次的修改时间。服务端拿这个时间与图片最新的修改时间做对比，如果不一样，那服务端就再次把图片内容发送给浏览器，否则直接返回 304 让浏览器从缓存里去取。

> 协商缓存(last-modified)缺点：协商缓存(last-modified)是根据图片最后一次修改时间做
> 的，但是如果只是给图片修改了名字，或复制一下，其实图片的内容并没有改变，但是更改时间变化了，协商缓存(last-modified)就会命中，此时图片内容不变化并不希望缓存命中，因此还有第二种协商缓存，根据图片内容做判断。

> 协商缓存(etag)：协商缓存(etag)是根据图片的内容判断缓存是否命中，会把图片内容生成一个指纹，只要图片内容不变指纹就不会变。

> 协商缓存(etag)步骤：
> step1) 浏览器向服务端发送 http 请求：get http://localhost/x.png
> step2) 服务端收到请求后，读取图片内容并生成 etag，并设置响应头 etag：res.setHeader("ETag", etagData);且更改缓存为协商缓存 res.setHeader("Cache-Control", "no-cache");，否则默认仍是强制缓存，并把图片资源返回给客户端。
> step3) 客户端收到图片的响应后，同时 response header 中多了一个 etag 头：etag:"326-J+waJ3ocjhSutM7bfJnB0VzJyCY"
> ，这个 etag 就是 step2 中根据图片内容生成的指纹。
> step4）浏览器再次请求 get http://localhost/x.png，此时一定会建立 http 连接，这里跟强制缓存不一样，建立连接后请求头里会多一个 if-none-match 请求头：if-none-match:"326-J+waJ3ocjhSutM7bfJnB0VzJyCY"，这个请求头的指纹与 step2 和 step3 的指纹都是同一个指纹，根据图片内容生成的。服务端收到请求后拿这个指纹与图片最新的指纹做对比，如果不一样，那服务端就再次把图片内容发送给浏览器，否则直接返回 304 让浏览器从缓存里去取。

> 协商缓存(etag)缺点：协商缓存(etag)每次做判断时都要读取图片的整个内容生成指纹，有时图片会很大，读取内容会很耗费时间，这样会影响服务器性能。因此不能只用一种缓存，四种缓存是相互互补的，根据不同资源，应用不同缓存。

> catch control：no-catch，no-store
> no-store：no-store 是关闭缓存，不用强制缓存也不用协商缓存。
> no-catch：是关闭强制缓存，用协商缓存，因为强制缓存的优先级是大于协商缓存的，不关闭协商缓存就不能生效。
