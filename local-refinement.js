(() => {
  const details = {
    courtyard: ['PLACE · 550 m · Saved by @zoya', 'The Courtyard', '“Chai, something warm, and a seat by the window.” A first stop for an unhurried afternoon.'],
    records: ['EVENT · Tonight, 8 PM · Shared by @noor', 'Records & a little company', 'Long Play · 800 m away. Bring a record or come with an open mind. A small gathering, shared by someone nearby.'],
    corners: ['COLLECTION · 300 m · Made by @ajay', 'A slower corner of the city', 'Eight places for a day without a plan: a café, a second-hand bookshop, a quiet garden, and a few turns you might otherwise miss.'],
    bookshop: ['PLACE · 1.2 km · Saved by @leela', 'The second-hand bookshop', '“Ask about the ones in the suitcase outside.” A recommendation with a little more context than a star rating.'],
    screening: ['EVENT · Sunday, 6:30 PM · Shared by @maya', 'A film, then a conversation', 'Neighbourhood cinema · 1.4 km away. Stay after the credits and talk about what stayed with you.'],
    film: ['FILM · Illustrative weekly activity', '10 Things I Hate About You', '24 people recently saved this film in this demo. Shakespeare’s The Taming of the Shrew, moved to a 1999 high school. Stay for the bleachers scene.'],
    series: ['SERIES · Illustrative weekly activity', 'Family Business', '38 people recently saved this series in this demo. The French comedy where a family’s kosher butcher’s becomes a cannabis café. Three short seasons.'],
    light: ['FILM · Saved by @leela', 'All We Imagine as Light', '“For the nights you want to feel something.” Follow a recommendation back to the person who shared it.'],
    read: ['BOOK · Saved by @noor', 'Only Dull People Are Brilliant at Breakfast', 'Oscar Wilde, small enough for a coat pocket. Save it for the next slow breakfast.']
  };
  document.querySelectorAll('[data-local-experience]').forEach(root => {
    root.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
      root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-selected', String(b === button)));
      root.querySelectorAll('[data-mode-panel]').forEach(panel => panel.hidden = panel.dataset.modePanel !== button.dataset.mode);
      root.querySelector('.discovery-detail').hidden = true;
    }));
    root.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      root.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      root.querySelectorAll('[data-kind]').forEach(card => card.hidden = button.dataset.filter !== 'all' && card.dataset.kind !== button.dataset.filter);
      root.querySelector('.discovery-detail').hidden = true;
    }));
  });
  document.querySelectorAll('.local-experience, .discovery-map').forEach(root => {
    const panel = root.querySelector('.discovery-detail');
    root.querySelectorAll('[data-detail]').forEach(button => button.addEventListener('click', () => {
      const data = details[button.dataset.detail];
      panel.querySelector('.detail-kind').textContent = data[0];
      panel.querySelector('.detail-title').textContent = data[1];
      panel.querySelector('.detail-body').textContent = data[2];
      panel.querySelector('.detail-save').textContent = '＋ Save';
      panel.querySelector('.detail-save').setAttribute('aria-pressed', 'false');
      panel.hidden = false;
      root.querySelectorAll('.discovery-pin').forEach(pin => pin.setAttribute('aria-pressed', String(pin === button)));
    }));
    panel.querySelector('.close-detail').addEventListener('click', () => { panel.hidden = true; });
    panel.querySelector('.detail-save').addEventListener('click', event => {
      const saved = event.currentTarget.getAttribute('aria-pressed') !== 'true';
      event.currentTarget.setAttribute('aria-pressed', String(saved));
      event.currentTarget.textContent = saved ? '✓ Saved' : '＋ Save';
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') document.querySelectorAll('.discovery-detail').forEach(panel => panel.hidden = true);
  });
})();
