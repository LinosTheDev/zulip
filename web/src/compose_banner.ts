import $ from "jquery";

import render_compose_banner from "../templates/compose_banner/compose_banner.hbs";
import render_stream_does_not_exist_error from "../templates/compose_banner/stream_does_not_exist_error.hbs";

import * as scroll_util from "./scroll_util";

export let scroll_to_message_banner_message_id: number | null = null;
export function set_scroll_to_message_banner_message_id(val: number | null): void {
    scroll_to_message_banner_message_id = val;
}

// banner types
export const WARNING = "warning";
export const ERROR = "error";

const MESSAGE_SENT_CLASSNAMES = {
    sent_scroll_to_view: "sent_scroll_to_view",
    narrow_to_recipient: "narrow_to_recipient",
    scheduled_message_banner: "scheduled_message_banner",
};
// Technically, unmute_topic_notification is a message sent banner, but
// it has distinct behavior / look - it has an associated action button,
// does not disappear on scroll - so we don't include it here, as it needs
// to be handled separately.

export const CLASSNAMES = {
    ...MESSAGE_SENT_CLASSNAMES,
    // unmute topic notifications are styled like warnings but have distinct behaviour
    unmute_topic_notification: "unmute_topic_notification warning-style",
    // warnings
    topic_resolved: "topic_resolved",
    recipient_not_subscribed: "recipient_not_subscribed",
    wildcard_warning: "wildcard_warning",
    private_stream_warning: "private_stream_warning",
    // errors
    wildcards_not_allowed: "wildcards_not_allowed",
    subscription_error: "subscription_error",
    stream_does_not_exist: "stream_does_not_exist",
    missing_stream: "missing_stream",
    no_post_permissions: "no_post_permissions",
    private_messages_disabled: "private_messages_disabled",
    missing_private_message_recipient: "missing_private_message_recipient",
    invalid_recipient: "invalid_recipient",
    invalid_recipients: "invalid_recipients",
    deactivated_user: "deactivated_user",
    message_too_long: "message_too_long",
    topic_missing: "topic_missing",
    zephyr_not_running: "zephyr_not_running",
    generic_compose_error: "generic_compose_error",
    user_not_subscribed: "user_not_subscribed",
};

export function append_compose_banner_to_banner_list(
    new_row: HTMLElement | JQuery.htmlString,
): void {
    scroll_util.get_content_element($("#compose_banners")).append(new_row);
}

export function clear_message_sent_banners(include_unmute_banner = true): void {
    for (const classname of Object.values(MESSAGE_SENT_CLASSNAMES)) {
        $(`#compose_banners .${CSS.escape(classname)}`).remove();
    }
    if (include_unmute_banner) {
        clear_unmute_topic_notifications();
    }
    scroll_to_message_banner_message_id = null;
}

// TODO: Replace with compose_ui.hide_compose_spinner() when it is converted to ts.
function hide_compose_spinner(): void {
    $(".compose-submit-button .loader").hide();
    $(".compose-submit-button span").show();
    $(".compose-submit-button").removeClass("disable-btn");
}

export function clear_errors(): void {
    $(`#compose_banners .${CSS.escape(ERROR)}`).remove();
}

export function clear_warnings(): void {
    $(`#compose_banners .${CSS.escape(WARNING)}`).remove();
}

export function clear_unmute_topic_notifications(): void {
    $(`#compose_banners .${CLASSNAMES.unmute_topic_notification.replaceAll(" ", ".")}`).remove();
}

export function clear_all(): void {
    $(`#compose_banners`).empty();
}

export function show_error_message(message: string, classname: string, $bad_input?: JQuery): void {
    $(`#compose_banners .${CSS.escape(classname)}`).remove();

    const new_row = render_compose_banner({
        banner_type: ERROR,
        stream_id: null,
        topic_name: null,
        banner_text: message,
        button_text: null,
        classname,
    });
    append_compose_banner_to_banner_list(new_row);

    hide_compose_spinner();

    if ($bad_input !== undefined) {
        $bad_input.trigger("focus").trigger("select");
    }
}

export function show_stream_does_not_exist_error(stream_name: string): void {
    // Remove any existing banners with this warning.
    $(`#compose_banners .${CSS.escape(CLASSNAMES.stream_does_not_exist)}`).remove();

    const new_row = render_stream_does_not_exist_error({
        banner_type: ERROR,
        stream_name,
        classname: CLASSNAMES.stream_does_not_exist,
    });
    append_compose_banner_to_banner_list(new_row);
    hide_compose_spinner();

    // A copy of `compose_recipient.open_compose_stream_dropup()` that
    // can't be imported due to typescript and import circles.
    // TODO: Once we use stream IDs, not names, as the fundamental
    // compose_state storage for streams, this error will be impossible.
    if ($("#id_compose_select_recipient").hasClass("open")) {
        return;
    }
    $("#id_compose_select_recipient button").trigger("click");
}