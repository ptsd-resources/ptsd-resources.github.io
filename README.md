# ptsd-resources
-----

## local

Serve: `python3 -m http.server 8080 &`

Watch: `sass --watch assets/index.sass:assets/index.css`

## about

I wrote [an article on PTSD resources](https://medium.com/@rhetoricize/d6fd776339a8). It got too long and I decided it needed a quick-ref website.

## technical reqs
This probably would have worked fine using Jekyll, but this janky approach was pretty fast and light, so oh well.
- [x] define FAQ categories with ordered lists of resources
- [x] define resources which can be included like partials across multiple pages

### regrets (future to-fixes?)
- Multi-paragraph items containing HTML are really messy with this approach. I find it acceptable because I'm mostly just copying text out of the article I wrote, but it might be a pain if I end up primarily editing here.

## TODOS

- [ ] implement url hash browser back
- [x] basic mobile responsive nav -> collapsible topbar
- [ ] mobile first???
- [x] vocab feature
- [ ] caption datatype?
- [x] literally any styling lol
- [x] switch to SASS
- [x] import my nice sass mixins
- [ ] icons for resource types? (book, graphic, etc)

### quickies
- [x] index/about page
- [x] add amazon affiliate disclaimer
- [x] menu current selection cue
- [x] feedback form
