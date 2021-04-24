(function (window, document) {
    InboxSDK.load(2, 'sdk_cega-gmail_a00281a1f8').then(function (sdk) {
        appIframe = document.createElement('iframe');
        loggedInUserEmailId = sdk.User.getEmailAddress();
        conversationViewDisabled = sdk.User.isConversationViewDisabled();
        appIframe.setAttribute('src', '<APP_HOST>');
        appIframe.setAttribute('class', 'app-iframe');
        appIframe.setAttribute('name', 'cegaApp');
        sdk.Global.addSidebarContentPanel({
            iconUrl: chrome.extension.getURL('icons/Icon16.png'),
            hideTitleBar: true,
            el: appIframe
        });

        sdk.Conversations.registerMessageViewHandler(function (messageView) {
            messageView.isLoaded() ? onMessageLoaded(messageView) : messageView.on('load', function () {
                return onMessageLoaded(messageView);
            });

            messageView.on('destroy', function () {
                message = {};
                message.type = 'messageDestroy';
                console.log("MESSAGE: messageDestroy ");
                postMessage(message);
            });
        });

        sdk.Compose.registerComposeViewHandler(function (composeView) {
            composeView.on('recipientsChanged', function () {
                return onRecipientsChanged(composeView);
            });

            composeView.on('minimized', function () {
                return onComposeViewUnfocused();
            });

            composeView.on('destroy', function (event) {
                return onComposeViewUnfocused();
            });

            composeView.on('restored', function (event) {
                return onComposeViewRestored(composeView);
            });

            composeView.on('sent', function (event) {
                return onMessageSent(composeView, event);
            });

            composeView.addButton({
                title: "Save and Send Email",
                iconUrl: chrome.extension.getURL('icons/Icon16.png'),
                onClick: function (event) {
                    composeView.send();
                },
                hasDropdown: false,
                type: "MODIFIER",
                orderHint: 0
            });
        });

    });

    function onMessageLoaded(msgView) {
        return msgView.getMessageIDAsync().then(function (messageId) {
            console.log("MESSAGE: messageRead ");
            postMessage(generateMessage('messageRead', messageId, msgView));
        });
    }

    function onRecipientsChanged(composeView) {
        return composeView.getDraftID().then(function (draftId) {
            console.log("COMPOSE: recipientsChanged ");
            postMessage(generateMessage('recipientsChanged', draftId, composeView));
        });
    }

    function onMessageSent(composeView, event) {
        return event.getMessageID().then(function (messageId) {
            console.log("COMPOSE: sent ");
            postMessage(generateMessage('sent', messageId, composeView));
        });
    }

    function onComposeViewRestored(composeView) {
        return composeView.getDraftID().then(function (draftId) {
            console.log("COMPOSE: messageComposeRestored ");
            postMessage(generateMessage('messageComposeRestored', draftId, composeView));
        });
    }

    function onComposeViewUnfocused() {
        message = {};
        message.type = 'composeViewUnfocused';
        console.log("COMPOSE: composeViewUnfocused ");
        postMessage(message);
    }

    function postMessage(message){
        window.frames.cegaApp.postMessage(JSON.stringify(message), '<APP_HOST>');
    } 

    function generateMessage(eventType, id, view) {
        message = {id: id, type:eventType};
        // message.id = id;
        // message.type = eventType;
        switch (eventType) {
            case 'messageRead':
                message.subject = view.getThreadView().getSubject();
                message.body = view.getBodyElement().innerHTML;
                message.sender = view.getSender();
                message.recipientsTo = view.getRecipientEmailAddresses();
                return message;
            case 'recipientsChanged':
                message.sender = view.getFromContact();
                message.recipientsTo = view.getToRecipients();
                return message;
            case 'messageComposeRestored':
            case 'sent':
                message.subject = view.getSubject();
                message.body = view.getHTMLContent();
                message.sender = view.getFromContact();
                message.recipientsTo = view.getToRecipients();
                return message;
            default:
        }
    }
}(window, document));
