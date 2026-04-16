export type ThemedAlertButton = {
  text: string;
  onPress?: () => void | Promise<void>;
  style?: 'default' | 'cancel' | 'destructive';
};

export type ThemedAlertPayload = {
  title: string;
  message?: string;
  buttons?: ThemedAlertButton[];
};

type Presenter = (payload: ThemedAlertPayload) => void;

let presenter: Presenter | null = null;

export function setThemedAlertPresenter(nextPresenter: Presenter | null): void {
  presenter = nextPresenter;
}

export function showThemedAlert(payload: ThemedAlertPayload): void {
  if (!presenter) {
    console.warn('[themedAlert] presenter not mounted');
    return;
  }
  presenter(payload);
}

export function showThemedAlertSimple(
  title: string,
  message?: string,
  buttons?: ThemedAlertButton[],
): void {
  showThemedAlert({ title, message, buttons });
}
