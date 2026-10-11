// Settings for the two content types shown by ContentList and ContentDetail.
export const articles = {
    apiPath: 'articles',
    listPath: '/articles',
    detailPath: '/article',
    commentType: 'Article',
    singular: 'article',
    plural: 'articles',
    title: 'Article',
    heading: '📰 Shop Articles',
    subtitle: 'Stay updated with the latest news, tips, and insights from our bookstore',
    writeLabel: '✍️ Write an Article',
    color: 'primary',
    buttonClass: 'btn-primary',
    hasCategory: true
};

export const blogPosts = {
    apiPath: 'blog',
    listPath: '/blog-posts',
    detailPath: '/blog-post',
    commentType: 'BlogPost',
    singular: 'blog post',
    plural: 'blog posts',
    title: 'Blog Post',
    heading: '📚 Book Reviews & Stories',
    subtitle: 'Discover insights about our classic book collection and literary stories',
    writeLabel: '✍️ Write a Blog Post',
    color: 'info',
    buttonClass: 'btn-info text-white',
    hasCategory: false
};
