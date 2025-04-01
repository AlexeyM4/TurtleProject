document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.news-header, .news-arrow').forEach(header => {
        header.addEventListener('click', function(e) {
            e.stopPropagation();
            const newsItem = this.closest('.news-item');

            if (newsItem.classList.contains('expanded')) {
                newsItem.classList.remove('expanded');
                return;
            }

            document.querySelectorAll('.news-item.expanded').forEach(item => {
                if (item !== newsItem) {
                    item.classList.remove('expanded');
                }
            });

            newsItem.classList.add('expanded');

            setTimeout(() => {
                newsItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        });
    });
});