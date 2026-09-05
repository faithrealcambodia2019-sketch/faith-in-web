/*
 * Handler table for bible.html.
 *
 * These were inline on* attributes. Inline handlers are the reason
 * script-src cannot drop 'unsafe-inline', and 'unsafe-inline' is what turns
 * an XSS bug from inert into exploitable — so they have to go.
 *
 * The move is deliberately mechanical: each expression is copied verbatim
 * into a function and called with the element as `this` and the event as
 * `event`, which is exactly what an inline handler does. Nothing is
 * rewritten, so nothing changes behaviour.
 *
 * Generated from the markup; the dynamic handlers built inside template
 * literals are a separate pass.
 */
(function () {
  'use strict';

  var handlers = [
    /* 0   click  */ function (event) { window.switchTool('reader') },
    /* 1   click  */ function (event) { window.switchTool('parallel') },
    /* 2   click  */ function (event) { window.switchTool('concordance') },
    /* 3   click  */ function (event) { window.switchTool('resources') },
    /* 4   click  */ function (event) { window.switchTool('history') },
    /* 5   click  */ function (event) { window.switchTool('atlas') },
    /* 6   click  */ function (event) { window.switchTool('designer') },
    /* 7   click  */ function (event) { window.switchTool('typing') },
    /* 8   click  */ function (event) { window.switchTool('plans') },
    /* 9   click  */ function (event) { window.switchTool('prayer') },
    /* 10  click  */ function (event) { window.switchTool('daily') },
    /* 11  click  */ function (event) { window.switchTool('notes') },
    /* 12  click  */ function (event) { window.switchTool('reader') },
    /* 13  click  */ function (event) { window.switchTool('parallel') },
    /* 14  click  */ function (event) { window.switchTool('concordance') },
    /* 15  click  */ function (event) { window.switchTool('resources') },
    /* 16  click  */ function (event) { window.switchTool('history') },
    /* 17  click  */ function (event) { window.switchTool('designer') },
    /* 18  click  */ function (event) { window.switchTool('plans') },
    /* 19  click  */ function (event) { window.switchTool('typing') },
    /* 20  click  */ function (event) { window.switchTool('atlas') },
    /* 21  click  */ function (event) { window.switchTool('prayer') },
    /* 22  click  */ function (event) { window.switchTool('daily') },
    /* 23  click  */ function (event) { window.switchTool('notes') },
    /* 24  click  */ function (event) { window.copyDailyVerse() },
    /* 25  click  */ function (event) { window.switchTool('daily') },
    /* 26  click  */ function (event) { window.designDailyVerse() },
    /* 27  click  */ function (event) { window.switchTool('concordance') },
    /* 28  click  */ function (event) { window.prevChapter() },
    /* 29  click  */ function (event) { window.nextChapter() },
    /* 30  click  */ function (event) { window.toggleChapterAudioSpeech() },
    /* 31  click  */ function (event) { window.clearReaderSearch() },
    /* 32  click  */ function (event) { window.setReaderTheme('default') },
    /* 33  click  */ function (event) { window.setReaderTheme('sepia') },
    /* 34  click  */ function (event) { window.setReaderTheme('dark') },
    /* 35  click  */ function (event) { window.copyChapterPassage() },
    /* 36  click  */ function (event) { window.sendChapterToDesigner() },
    /* 37  click  */ function (event) { window.clearReaderSearch() },
    /* 38  click  */ function (event) { window.prevChapter() },
    /* 39  click  */ function (event) { window.nextChapter() },
    /* 40  click  */ function (event) { window.downloadCardImage(1) },
    /* 41  click  */ function (event) { window.downloadCardImage(2) },
    /* 42  click  */ function (event) { window.setDesignerRatio('1:1') },
    /* 43  click  */ function (event) { window.setDesignerRatio('9:16') },
    /* 44  click  */ function (event) { window.setDesignerRatio('16:9') },
    /* 45  click  */ function (event) { window.setDesignerRatio('4:5') },
    /* 46  click  */ function (event) { window.randomizeCardStyle() },
    /* 47  click  */ function (event) { window.copyCardImageToClipboard() },
    /* 48  click  */ function (event) { window.shareCardToFaithInFeed() },
    /* 49  click  */ function (event) { window.setDesignerBlur(0) },
    /* 50  click  */ function (event) { window.setDesignerBlur(3) },
    /* 51  click  */ function (event) { window.setDesignerBlur(6) },
    /* 52  change */ function (event) { window.setDesignerFontEnglish(this.value) },
    /* 53  change */ function (event) { window.setDesignerBorderStyle(this.value) },
    /* 54  click  */ function (event) { window.setDesignerTextAlign('left') },
    /* 55  click  */ function (event) { window.setDesignerTextAlign('center') },
    /* 56  click  */ function (event) { window.setDesignerTextAlign('right') },
    /* 57  change */ function (event) { window.toggleDesignerBranding(this.checked) },
    /* 58  click  */ function (event) { window.designDailyVerse() },
    /* 59  click  */ function (event) { window.copyDailyVerse() },
    /* 60  click  */ function (event) { window.searchConcordanceWord() },
    /* 61  click  */ function (event) { window.setMemoryMode('recite') },
    /* 62  click  */ function (event) { window.setMemoryMode('hide') },
    /* 63  click  */ function (event) { window.setMemoryMode('typing') },
    /* 64  click  */ function (event) { window.setMemoryMode('flashcard') },
    /* 65  click  */ function (event) { window.setMemoryHideLevel(25) },
    /* 66  click  */ function (event) { window.setMemoryHideLevel(50) },
    /* 67  click  */ function (event) { window.setMemoryHideLevel(100) },
    /* 68  click  */ function (event) { window.revealAllWords() },
    /* 69  click  */ function (event) { window.toggleFlashcard() },
    /* 70  click  */ function (event) { window.prevMemoryPassage() },
    /* 71  click  */ function (event) { window.nextMemoryPassage() },
    /* 72  click  */ function (event) { window.filterMemoryPart(0) },
    /* 73  click  */ function (event) { window.filterMemoryPart(1) },
    /* 74  click  */ function (event) { window.filterMemoryPart(2) },
    /* 75  click  */ function (event) { window.filterMemoryPart(3) },
    /* 76  click  */ function (event) { window.filterMemoryPart(4) },
    /* 77  click  */ function (event) { window.filterMemoryPart(5) },
    /* 78  click  */ function (event) { window.clearMemorySearch() },
    /* 79  click  */ function (event) { window.saveSermonNotesAction() },
    /* 80  click  */ function (event) { window.startGuidedPrayerTimer() },
    /* 81  click  */ function (event) { window.openNewPrayerModal(true) },
    /* 82  click  */ function (event) { window.setPrayerFilter('all') },
    /* 83  click  */ function (event) { window.setPrayerFilter('personal') },
    /* 84  click  */ function (event) { window.setPrayerFilter('church') },
    /* 85  click  */ function (event) { window.setPrayerFilter('family') },
    /* 86  click  */ function (event) { window.setPrayerFilter('answered') },
    /* 87  click  */ function (event) { window.openNewPrayerModal(false) },
    /* 88  click  */ function (event) { window.saveNewPrayer() },
    /* 89  click  */ function (event) { window.setHistoryViewMode('era') },
    /* 90  click  */ function (event) { window.setHistoryViewMode('chapters') },
    /* 91  input  */ function (event) { window.searchHistory(this.value) },
    /* 92  click  */ function (event) { window.searchHistory('') },
    /* 93  click  */ function (event) { window.searchHistory('') },
    /* 94  click  */ function (event) { window.setHistoryViewMode('chapters') },
    /* 95  click  */ function (event) { window.setResourceCategory('all') },
    /* 96  click  */ function (event) { window.setResourceCategory('methods') },
    /* 97  click  */ function (event) { window.setResourceCategory('creeds') },
    /* 98  click  */ function (event) { window.setResourceCategory('theology') },
    /* 99  click  */ function (event) { window.setResourceCategory('cambodia') },
    /* 100 input  */ function (event) { window.searchResources() },
    /* 101 click  */ function (event) { document.getElementById('resource-search-input').value=''; window.searchResources(); }
  ];

  ['click', 'change', 'input'].forEach(function (type) {
    var attribute = 'data-h-' + type;
    document.addEventListener(type, function (event) {
      var el = event.target && event.target.closest && event.target.closest('[' + attribute + ']');
      if (!el) return;
      var fn = handlers[Number(el.getAttribute(attribute))];
      if (typeof fn === 'function') fn.call(el, event);
    });
  });
})();
