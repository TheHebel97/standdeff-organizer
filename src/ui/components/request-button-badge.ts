import {LocalStorageHelper} from "../../helpers/local-storage-helper";

const REQUEST_BADGE_ID = "requestBunkerNotificationBadge";
const REQUEST_BADGE_STYLE_ID = "requestBunkerNotificationBadgeStyle";

function ensureRequestBadgeStyles() {
    if (document.getElementById(REQUEST_BADGE_STYLE_ID)) {
        return;
    }

    const style = document.createElement("style");
    style.id = REQUEST_BADGE_STYLE_ID;
    style.innerHTML = `
.notification-badge-blue {
  position: relative;
  top: -10px;
  right: 10px;
  background-color: #0057d9;
  color: white;
  border-radius: 50%;
  padding: 5px 10px;
  font-size: 12px;
}`;
    document.head.appendChild(style);
}

export function syncRequestBunkerBadge(currentThreadId: string) {
    const $button = $("#requestBunker");
    if ($button.length === 0) {
        return;
    }

    ensureRequestBadgeStyles();

    const requestCount = LocalStorageHelper.getInstance().getSdInquiry(currentThreadId).length;
    const $badge = $(`#${REQUEST_BADGE_ID}`);

    if (requestCount > 0) {
        if ($badge.length === 0) {
            $button.after(`<span class="notification-badge-blue" id="${REQUEST_BADGE_ID}">!</span>`);
        }
        return;
    }

    $badge.remove();
}
