1. 这是一个react19的项目，在修改代码时应该优先考虑最新的hooks，latest version of react。
2. 项目中使用了tailwindcss，在修改tailwindcss配置时，应该优先考虑最新的tailwindcss版本。
3. 项目中使用了zustand，在修改zustand状态管理时，应该优先考虑最新的zustand版本。
4. 项目中使用了next.js，在修改next.js配置时，应该优先考虑最新的next.js版本。
5. 项目中使用了typescript，在修改typescript配置时，应该优先考虑最新的typescript版本。
6. 项目中引入了shadcn/ui，在修改shadcn/ui组件时，应该优先考虑最新的shadcn/ui版本。
7. 每次修改完之后不要build, 不要验证，我作为开发者会自己去验证。
8. 当你新建一个页面时，应该考虑到页面的宽度；desktop最小600px；手机最小280px;屏幕宽度超过1024时，我希望form的label和input/value是左右排布的，只有小于这个宽度才变成上下排布
9. 这个项目支持中英双文，每个页面做修改时应该考虑到使用i18n。
10. 每次引入依赖时应该考虑到是不是只有dev时需要，prod不需要。
11. 使用zod时，email和url都不需要使用.string()，直接使用z.email()和z.url()即可。
