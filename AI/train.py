# ========================
# train.py — Entry point: chỉ chứa hàm main()
# ========================
# Logic xử lý đã được tách sang các module con:
#   config.py        — Hằng số nghiệp vụ
#   data_loader.py   — Tải & tiền xử lý dataset
#   preprocessing.py — Recency features & Oversampling
#   model_trainer.py — Định nghĩa & evaluate model
#   visualizer.py    — Vẽ biểu đồ
#   model_saver.py   — Lưu model & metadata

from sklearn.model_selection import train_test_split

from data_loader   import load_dataset
from preprocessing import oversample_minority
from model_trainer import get_models, evaluate_model
from visualizer    import plot_confusion_matrix, plot_roc_curves, plot_feature_importance
from model_saver   import save_artifacts


def main():
    # ========================
    # 1. Tải dataset
    # ========================
    data = load_dataset("donor_dataset.csv")

    print("\n=== Data sample (trước oversample) ===")
    print(data.head())
    print("\nColumns:", list(data.columns))
    print("Shape  :", data.shape)
    print("Label dist:", data["label"].value_counts().to_dict())

    # Mean age từ dataset GỐC (trước oversample) để age_default phản ánh đúng dữ liệu thật
    age_default = int(round(data["age"].mean()))
    print(f"\nAge default (mean, dữ liệu gốc): {age_default}")

    # ========================
    # 2. Oversample class Donate (label=1) lên 60:40
    # ========================
    data = oversample_minority(data, target_ratio=0.6, noise_frac=0.03, random_state=42)

    print("\n=== Data sample (sau oversample) ===")
    print("Shape  :", data.shape)
    print("Label dist:", data["label"].value_counts().to_dict())
    print("Label %  :", (data["label"].value_counts(normalize=True) * 100).round(2).to_dict())

    feature_cols = [col for col in data.columns if col != "label"]
    X = data[feature_cols]
    y = data["label"]

    neg_count = (y == 0).sum()
    pos_count = (y == 1).sum()
    print(f"\nClass ratio (0:1) = {neg_count/pos_count:.4f}")

    # Split — test set tách ra trước, không tham gia CV
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # ========================
    # 3. Train & Evaluate 3 models
    # ========================
    models = get_models()
    results = {}
    for name, model in models.items():
        results[name] = evaluate_model(name, model, X_train, X_test, y_train, y_test)

    # ========================
    # 4. Tổng hợp kết quả
    # ========================
    print("\n" + "="*50)
    print("  TỔNG HỢP KẾT QUẢ")
    print("="*50)
    print(f"{'Model':<25} {'Accuracy':>10} {'AUC':>8} {'CV AUC':>10}")
    print("-"*55)
    for name, r in results.items():
        print(f"{name:<25} {r['acc']:>10.4f} {r['auc']:>8.4f} {r['cv_mean']:>8.4f}±{r['cv_std']:.4f}")

    best_name = max(results, key=lambda k: results[k]["auc"])
    print(f"\n→ Best model: {best_name} (AUC = {results[best_name]['auc']:.4f})")

    best_model = results[best_name]["model"]
    best_pred  = results[best_name]["y_pred"]

    # ========================
    # 5. Vẽ biểu đồ
    # ========================
    plot_confusion_matrix(y_test, best_pred, best_name)
    plot_roc_curves(results)
    plot_feature_importance(best_model, best_name, feature_cols)

    # ========================
    # 6. Lưu model & metadata
    # ========================
    save_artifacts(best_model, feature_cols, age_default)


# ========================
# RUN
# ========================
if __name__ == "__main__":
    main()
